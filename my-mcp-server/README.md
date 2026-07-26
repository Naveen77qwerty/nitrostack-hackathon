# Enterprise Knowledge Integrity MCP Server

> **An MCP server that detects when authoritative enterprise knowledge changes, traces what depends on it, finds contradictions, assesses risk, proposes fixes, and records everything — all through MCP tools an LLM can orchestrate.**

---

## What It Does

When an enterprise updates a policy (discount limits, data retention rules, security requirements), every document, playbook, and training material that references that policy may become outdated or contradictory. This MCP server automates the entire knowledge integrity lifecycle:

1. **Detect** which authoritative facts changed between policy versions
2. **Trace** every document and claim that depends on the changed fact
3. **Find** contradictions where documents disagree with the new authoritative value
4. **Assess** risk based on customer-facing exposure, financial impact, compliance, and document criticality
5. **Propose** human-approved remediations (never auto-applies changes)
6. **Record** every decision in a full audit trail

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP Client (LLM)                          │
│              Claude Desktop / Cursor / IDE                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ MCP Protocol (JSON-RPC 2.0)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              NitroStack MCP Server                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Tools   │  │Resources │  │ Prompts  │                  │
│  │  (14)    │  │  (7)     │  │  (7)     │                  │
│  └────┬─────┘  └────┬─────┘  └──────────┘                  │
│       │              │                                      │
│  ┌────▼──────────────▼─────────────────────────────┐       │
│  │              Service Layer                       │       │
│  │  ChangeDetection │ Dependency │ Validation       │       │
│  │  Conflict        │ Risk       │ Remediation      │       │
│  │  Provenance      │ Audit      │ Drift            │       │
│  │  Report          │ Batch      │ PdfIngestion     │       │
│  └──────────────────────┬──────────────────────────┘       │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────┐       │
│  │           DataLoaderService                      │       │
│  │    JSON files + optional PDF ingestion           │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer (JSON + PDF)                     │
│  authoritative_sources.json  ← current policy facts         │
│  authoritative_sources_v1.json  ← previous version          │
│  documents.json  ← enterprise docs with claims              │
│  dependencies.json  ← fact → document mappings              │
│  pending_updates.json  ← remediation proposals              │
│  audit_log.json  ← approved/rejected/applied history        │
│  pdfs/  ← optional PDF-based authoritative sources          │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
# Install dependencies
npm install

# Build the server
npm run build

# Start in development mode (stdio transport)
npm run dev

# Run all tests
npm test

# Start in production mode
npm run start:prod
```

## MCP Tools (14)

| Tool | Read-only | Description |
|------|-----------|-------------|
| `detect_source_changes` | ✅ | Compare v1 vs v2 authoritative sources |
| `find_affected_knowledge` | ✅ | Trace dependency graph from a changed fact |
| `validate_claim` | ✅ | Check if a claim matches its authoritative value |
| `detect_knowledge_conflicts` | ✅ | Find all contradictions for a fact |
| `trace_knowledge_provenance` | ✅ | Show origin and version history of a claim |
| `assess_knowledge_risk` | ✅ | Score risk of a conflict (0–100) |
| `propose_knowledge_update` | ❌ | Create a remediation proposal |
| `approve_knowledge_update` | ❌ | Apply an approved fix |
| `reject_knowledge_update` | ❌ | Reject a proposal |
| `get_audit_log` | ✅ | View remediation history |
| `investigate_knowledge_change` | ✅ | Full investigation pipeline |
| `batch_approve_updates` | ❌ | Approve multiple proposals at once |
| `generate_compliance_report` | ✅ | Compliance report for auditors |
| `get_knowledge_drift_summary` | ✅ | Knowledge staleness dashboard |

## MCP Resources (7)

| Resource URI | Description |
|-------------|-------------|
| `knowledge://sources` | Current authoritative sources and facts |
| `knowledge://documents` | Enterprise documents with claims |
| `knowledge://pending-updates` | Proposals awaiting approval |
| `knowledge://audit-log` | Complete remediation history |
| `knowledge://dependency-graph` | Full fact → document dependency tree |
| `knowledge://health-metrics` | Overall knowledge health score |
| `knowledge://source-owners` | Source ownership and classification |

## MCP Prompts (7)

| Prompt | Description |
|--------|-------------|
| `investigate_policy_change` | Step-by-step investigation guide |
| `knowledge_health_check` | Health assessment checklist |
| `compliance_audit_report` | Auditor-ready report template |
| `department_knowledge_review` | Per-department review guide |
| `remediation_planning` | Fix planning workflow |
| `executive_knowledge_briefing` | Executive summary template |
| `rollback_assessment` | Rollback decision framework |

## Project Structure

```
src/
  index.ts                          # Entry point
  app.module.ts                     # Root module
  types/index.ts                    # TypeScript interfaces
  modules/knowledge/
    knowledge.tools.ts              # 14 MCP tool handlers
    knowledge.resources.ts          # 7 MCP resources
    knowledge.prompts.ts            # 7 MCP prompts
    knowledge.module.ts             # Module registration
  services/
    data-loader.service.ts          # JSON/PDF data access
    change-detection.service.ts     # v1 vs v2 comparison
    dependency.service.ts           # Dependency graph traversal
    validation.service.ts           # Claim validation
    conflict.service.ts             # Contradiction detection
    provenance.service.ts           # Origin tracing
    risk.service.ts                 # Risk scoring
    remediation.service.ts          # Proposal CRUD
    audit.service.ts                # Audit trail
    drift.service.ts                # Staleness metrics
    report.service.ts               # Compliance reports
    batch.service.ts                # Batch operations
    pdf-ingestion.service.ts        # PDF parsing
  middleware/
    error-handling.middleware.ts    # Error formatting
  health/
    system.health.ts                # System resource monitoring
  data/
    authoritative_sources.json      # Current policy facts
    authoritative_sources_v1.json   # Previous version
    documents.json                  # Enterprise documents
    dependencies.json               # Fact → document mappings
    pending_updates.json            # Remediation proposals
    audit_log.json                  # Decision history
    pdfs/                           # PDF-based sources
tests/
  phase4.test.ts                    # Core service tests
  phase7.test.ts                    # Remediation tests
  phase8.test.ts                    # Investigation tests
  phase9.test.ts                    # MCP server lifecycle
  phase10.test.ts                   # Drift/report/batch tests
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NITRO_LOG_LEVEL` | `info` | Logging verbosity |
| `NITROSTACK_APP_MODE` | `development` | App mode |
| `MCP_TRANSPORT_TYPE` | auto-detected | `stdio`, `http`, or `dual` |

## Claude Desktop Integration

```json
{
  "mcpServers": {
    "knowledge-integrity": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/my-mcp-server",
      "env": {
        "NITROSTACK_APP_MODE": "production"
      }
    }
  }
}
```

## Key Design Decisions

- **Human-in-the-loop**: The server never auto-applies changes. Every fix goes through `propose → approve → apply` with audit logging.
- **Deterministic risk scoring**: Risk is calculated server-side with a fixed algorithm. The LLM explains the score; it doesn't calculate it.
- **Read-only investigation**: `investigate_knowledge_change` runs the full pipeline without modifying anything.
- **JSON persistence**: Simple, auditable, version-controllable. No database required.
- **Error handling middleware**: All tools are wrapped with `ErrorHandlingMiddleware` for consistent error formatting.

## License

MIT
