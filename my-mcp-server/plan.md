# Enterprise Knowledge Integrity MCP Server — Implementation Plan

> **MCP Hackathon Project**
> An MCP server that detects when authoritative enterprise knowledge changes, traces what depends on it, finds contradictions, assesses risk, proposes fixes, and records everything — all through MCP tools an LLM can orchestrate.

---

## Core Pipeline

```
LLM → MCP Server → detect changed facts → trace dependent knowledge
    → find contradictions → assess risk → propose remediation
    → human approval → update → audit
```

---

## Table of Contents

1. [Architecture](#architecture)
2. [Tech Stack & Existing Codebase](#tech-stack--existing-codebase)
3. [Phase 1 — Project Scaffolding](#phase-1--project-scaffolding)
4. [Phase 2 — Synthetic Knowledge Base](#phase-2--synthetic-knowledge-base)
5. [Phase 3 — Knowledge Dependency Model](#phase-3--knowledge-dependency-model)
6. [Phase 4 — Core MCP Tools (Detection & Traversal)](#phase-4--core-mcp-tools-detection--traversal)
7. [Phase 5 — Validation & Conflict Tools](#phase-5--validation--conflict-tools)
8. [Phase 6 — Provenance & Risk Tools](#phase-6--provenance--risk-tools)
9. [Phase 7 — Remediation & Audit Tools](#phase-7--remediation--audit-tools)
10. [Phase 8 — High-Level Investigation Tool](#phase-8--high-level-investigation-tool)
11. [Phase 9 — MCP Client Connection & Demo](#phase-9--mcp-client-connection--demo)
12. [File Map](#file-map)
13. [Complete Tool Reference](#complete-tool-reference)
14. [Demo Script](#demo-script)

---

## Architecture

```
Claude / ChatGPT / NitroStudio (MCP Client)
                │
                │  MCP Protocol (STDIO / HTTP SSE)
                ▼
┌───────────────────────────────────────────────┐
│  Enterprise Knowledge Integrity MCP Server     │
│  (NitroStack — TypeScript)                     │
│                                                │
│  ┌───────────────────────────────────────────┐ │
│  │             MCP TOOLS (9 tools)           │ │
│  │                                           │ │
│  │  detect_source_changes                    │ │
│  │  find_affected_knowledge                  │ │
│  │  validate_claim                           │ │
│  │  detect_knowledge_conflicts               │ │
│  │  trace_knowledge_provenance               │ │
│  │  assess_knowledge_risk                    │ │
│  │  propose_knowledge_update                 │ │
│  │  approve_knowledge_update                 │ │
│  │  get_audit_log                            │ │
│  └─────────────────┬─────────────────────────┘ │
│                    │                            │
│  ┌─────────────────▼─────────────────────────┐ │
│  │           SERVICES LAYER                  │ │
│  │                                           │ │
│  │  ChangeDetectionService                   │ │
│  │  DependencyService                        │ │
│  │  ValidationService                        │ │
│  │  ConflictService                          │ │
│  │  ProvenanceService                        │ │
│  │  RiskService                              │ │
│  │  RemediationService                       │ │
│  │  AuditService                             │ │
│  └─────────────────┬─────────────────────────┘ │
│                    │                            │
│  ┌─────────────────▼─────────────────────────┐ │
│  │       KNOWLEDGE DATA LAYER                │ │
│  │                                           │ │
│  │  authoritative_sources.json   (versioned) │ │
│  │  authoritative_sources_v1.json (previous) │ │
│  │  documents.json               (20+ docs)  │ │
│  │  dependencies.json            (graph)     │ │
│  │  pending_updates.json         (proposals) │ │
│  │  audit_log.json               (history)   │ │
│  └───────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘
```

---

## Tech Stack & Existing Codebase

### What we're building on

The project already has a working NitroStack MCP server (calculator starter template):

| Component | File | Status |
|-----------|------|--------|
| Entry point | `src/index.ts` | **Keep as-is** — bootstrap logic is generic |
| App module | `src/app.module.ts` | **Modify** — swap calculator for knowledge modules |
| Calculator module | `src/modules/calculator/*` | **Delete** — replace entirely |
| Health check | `src/health/system.health.ts` | **Keep as-is** |
| Widgets | `src/widgets/*` | **Keep for later** — optional dashboard |
| Config | `.env.example` | **Simplify** — no external APIs needed |

### Key NitroStack patterns to follow

From the existing calculator code, these are the decorator patterns we must use:

```typescript
// Tools — @ToolDecorator
import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';

@Tool({
  name: 'tool_name',
  description: 'What this tool does',
  inputSchema: z.object({ ... })
})
async myTool(input: any, ctx: ExecutionContext) { ... }

// Resources — @ResourceDecorator
import { ResourceDecorator as Resource } from '@nitrostack/core';

@Resource({
  uri: 'knowledge://sources',
  name: 'Name',
  description: 'Description',
  mimeType: 'application/json'
})
async getResource(uri: string, ctx: ExecutionContext) { ... }

// Prompts — @PromptDecorator
import { PromptDecorator as Prompt } from '@nitrostack/core';

@Prompt({
  name: 'prompt_name',
  description: 'Description',
  arguments: [{ name: 'arg', description: 'desc', required: true }]
})
async myPrompt(args: any, ctx: ExecutionContext) { ... }

// Modules — @Module
import { Module } from '@nitrostack/core';

@Module({
  name: 'module-name',
  description: 'Description',
  controllers: [ToolsClass, ResourcesClass, PromptsClass]
})
export class MyModule {}
```

### No external APIs needed

This project uses **only synthetic JSON data**. No GitHub tokens, no Jira API, no Slack integration. The entire knowledge base is self-contained in JSON files within the project. This makes the demo 100% reliable and reproducible.

---

## Phase 1 — Project Scaffolding

> **README Stage 1** · Estimated time: **30 minutes**

### 1.1 — Remove Calculator Module

Delete the entire `src/modules/calculator/` directory (4 files):
- `calculator.module.ts`
- `calculator.tools.ts`
- `calculator.resources.ts`
- `calculator.prompts.ts`

### 1.2 — Update App Module

Modify `src/app.module.ts`:

```typescript
import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { KnowledgeIntegrityModule } from './modules/knowledge/knowledge.module.js';
import { SystemHealthCheck } from './health/system.health.js';

@McpApp({
  module: AppModule,
  server: {
    name: 'knowledge-integrity-server',
    version: '1.0.0'
  },
  logging: {
    level: 'info'
  }
})
@Module({
  name: 'app',
  description: 'Enterprise Knowledge Integrity MCP Server — detects knowledge contradictions, traces dependencies, and manages remediation with human approval.',
  imports: [
    ConfigModule.forRoot(),
    KnowledgeIntegrityModule,
  ],
  providers: [
    SystemHealthCheck,
  ]
})
export class AppModule {}
```

### 1.3 — Simplify Environment Config

Update `.env.example` — no external API keys needed:

```env
# NitroStack Configuration
NITRO_LOG_LEVEL=info
NITROSTACK_APP_MODE=universal

# Transport
# MCP_TRANSPORT_TYPE=stdio
# PORT=3000
# HOST=localhost
```

### 1.4 — Create Directory Structure

```
src/
├── index.ts                          # Keep (no changes)
├── app.module.ts                     # Modify (Phase 1.2)
├── health/
│   └── system.health.ts              # Keep (no changes)
│
├── data/                             # NEW — Synthetic knowledge base
│   ├── authoritative_sources.json    # Current version of truth
│   ├── authoritative_sources_v1.json # Previous version (for change detection)
│   ├── documents.json                # 20+ enterprise documents with claims
│   ├── dependencies.json             # Fact → Document dependency graph
│   ├── pending_updates.json          # Proposed remediations (starts empty)
│   └── audit_log.json                # Approved changes history (starts empty)
│
├── types/                            # NEW — TypeScript interfaces
│   └── index.ts                      # All type definitions
│
├── services/                         # NEW — Business logic
│   ├── data-loader.service.ts        # Loads/writes JSON data files
│   ├── change-detection.service.ts   # Compares source versions
│   ├── dependency.service.ts         # Traverses dependency graph
│   ├── validation.service.ts         # Validates claims against facts
│   ├── conflict.service.ts           # Detects cross-document contradictions
│   ├── provenance.service.ts         # Traces knowledge origin
│   ├── risk.service.ts               # Deterministic risk scoring
│   ├── remediation.service.ts        # Proposes & applies updates
│   └── audit.service.ts              # Records all approved changes
│
└── modules/
    └── knowledge/                    # NEW — MCP module
        ├── knowledge.module.ts       # Module registration
        ├── knowledge.tools.ts        # All 9 MCP tools
        ├── knowledge.resources.ts    # MCP resources (knowledge base access)
        └── knowledge.prompts.ts      # MCP prompt templates
```

---

## Phase 2 — Synthetic Knowledge Base

> **README Stage 2** · Estimated time: **1–1.5 hours**

### 2.1 — Type Definitions

**File:** `src/types/index.ts`

```typescript
// ===== Authoritative Sources =====
export interface AuthoritativeSource {
  id: string;                        // e.g., "discount-policy"
  title: string;                     // e.g., "Enterprise Discount Policy"
  department: string;                // e.g., "Finance"
  version: string;                   // e.g., "2.0"
  effective_date: string;            // ISO date
  facts: Record<string, string>;     // e.g., { "maximum_discount": "10%" }
  metadata: {
    owner: string;
    last_updated: string;
    classification: 'public' | 'internal' | 'confidential';
  };
}

// ===== Documents & Claims =====
export interface Document {
  id: string;                        // e.g., "sales-playbook"
  title: string;                     // e.g., "Enterprise Sales Playbook"
  department: string;                // e.g., "Sales"
  type: 'playbook' | 'guide' | 'template' | 'training' | 'sop' | 'policy';
  last_reviewed: string;             // ISO date
  criticality: 'low' | 'medium' | 'high' | 'critical';
  customer_facing: boolean;
  claims: Claim[];
}

export interface Claim {
  id: string;                        // e.g., "sales-playbook.claim-1"
  text: string;                      // e.g., "Sales can provide discounts up to 20%."
  depends_on: string | null;         // e.g., "discount-policy.maximum_discount" or null
  section: string;                   // e.g., "Pricing Guidelines"
}

// ===== Dependencies =====
export interface Dependency {
  source_id: string;                 // Authoritative source ID
  fact_key: string;                  // Fact within the source
  dependent_document_id: string;     // Document that depends on this fact
  dependent_claim_id: string;        // Specific claim
  dependency_type: 'direct' | 'indirect';
}

// ===== Change Detection =====
export interface FactChange {
  source_id: string;
  source_title: string;
  fact_key: string;
  old_value: string;
  new_value: string;
  changed: boolean;
}

// ===== Validation =====
export type ValidationStatus = 'VALID' | 'CONFLICT' | 'AMBIGUOUS';

export interface ClaimValidation {
  document_id: string;
  document_title: string;
  claim_id: string;
  claim_text: string;
  depends_on: string;
  authoritative_value: string;
  status: ValidationStatus;
  explanation: string;
}

// ===== Risk =====
export interface RiskAssessment {
  document_id: string;
  document_title: string;
  claim_id: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_score: number;                // 0–100
  factors: {
    customer_facing: boolean;
    financial_impact: boolean;
    compliance_impact: boolean;
    operational_impact: boolean;
    confirmed_conflict: boolean;
    document_criticality: string;
  };
  reasons: string[];
}

// ===== Remediation =====
export type UpdateStatus = 'AWAITING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'APPLIED';

export interface ProposedUpdate {
  id: string;                        // UUID
  document_id: string;
  document_title: string;
  claim_id: string;
  current_text: string;
  suggested_text: string;
  authoritative_source: string;
  authoritative_fact: string;
  authoritative_value: string;
  risk_level: string;
  status: UpdateStatus;
  proposed_at: string;               // ISO timestamp
}

// ===== Audit =====
export interface AuditEntry {
  id: string;                        // UUID
  timestamp: string;                 // ISO timestamp
  action: 'UPDATE_APPROVED' | 'UPDATE_REJECTED' | 'UPDATE_APPLIED';
  document_id: string;
  document_title: string;
  claim_id: string;
  old_value: string;
  new_value: string;
  authoritative_source: string;
  reason: string;
  risk_level: string;
}

// ===== Provenance =====
export interface ProvenanceChain {
  claim: {
    document_id: string;
    document_title: string;
    claim_id: string;
    claim_text: string;
  };
  depends_on_fact: string;
  source_history: {
    source_id: string;
    source_title: string;
    version: string;
    value: string;
    status: 'current' | 'superseded';
  }[];
  is_current: boolean;
}
```

### 2.2 — Authoritative Sources (Current — v2)

**File:** `src/data/authoritative_sources.json`

Create **5–6 authoritative source documents**, each with multiple facts. These represent the **current truth**.

| Source ID | Title | Key Facts |
|-----------|-------|-----------|
| `discount-policy` | Enterprise Discount Policy | `maximum_discount: "10%"`, `approval_required_above: "5%"`, `discount_authority: "VP Sales"` |
| `data-retention-policy` | Data Retention Policy | `retention_period: "7 years"`, `deletion_method: "certified destruction"`, `backup_frequency: "daily"` |
| `remote-work-policy` | Remote Work Policy | `remote_days_per_week: "3"`, `core_hours: "10am-3pm"`, `equipment_stipend: "$1000"` |
| `vendor-approval-policy` | Vendor Approval Policy | `approval_threshold: "$10,000"`, `required_approvers: "2"`, `preferred_vendors_only: "true"` |
| `security-policy` | Information Security Policy | `password_rotation: "90 days"`, `mfa_required: "true"`, `data_classification_levels: "4"` |
| `expense-policy` | Travel & Expense Policy | `max_hotel_rate: "$200/night"`, `meal_per_diem: "$75"`, `flight_class: "economy"` |

### 2.3 — Authoritative Sources (Previous — v1)

**File:** `src/data/authoritative_sources_v1.json`

Same structure but with **different values** to create detectable changes:

| Source ID | Fact | v1 (Old) | v2 (Current) | Change Type |
|-----------|------|----------|-------------|-------------|
| `discount-policy` | `maximum_discount` | `"20%"` | `"10%"` | Reduced |
| `discount-policy` | `approval_required_above` | `"10%"` | `"5%"` | Stricter |
| `discount-policy` | `discount_authority` | `"Regional Manager"` | `"VP Sales"` | Elevated |
| `data-retention-policy` | `retention_period` | `"5 years"` | `"7 years"` | Extended |
| `remote-work-policy` | `remote_days_per_week` | `"5"` | `"3"` | Reduced |
| `remote-work-policy` | `equipment_stipend` | `"$500"` | `"$1000"` | Increased |
| `security-policy` | `password_rotation` | `"180 days"` | `"90 days"` | Stricter |

### 2.4 — Enterprise Documents (20+ documents)

**File:** `src/data/documents.json`

Create **20–25 documents** with a deliberate mix of:

| Category | Count | Examples |
|----------|-------|---------|
| ✅ **Correct** (references current values) | 6–8 | Pricing Guide says "10% max discount" |
| ❌ **Outdated/Conflicting** (references old values) | 8–10 | Sales Playbook says "20% max discount" |
| ❓ **Ambiguous** (references policy generically) | 3–4 | "Follow current discount policy" |
| ➖ **Unrelated** (no fact dependencies) | 3–4 | Company Mission Statement |

**Documents to create:**

| # | Document ID | Title | Department | Criticality | Customer-Facing | Has Conflicts? |
|---|-------------|-------|-----------|-------------|-----------------|----------------|
| 1 | `sales-playbook` | Enterprise Sales Playbook | Sales | critical | yes | ❌ discount: 20% |
| 2 | `proposal-template` | Client Proposal Template | Sales | critical | yes | ❌ discount: 20% |
| 3 | `pricing-guide` | Internal Pricing Guide | Finance | high | no | ✅ discount: 10% |
| 4 | `sales-training` | New Hire Sales Training | Sales | medium | no | ❌ discount: 20% |
| 5 | `discount-approval-sop` | Discount Approval Process SOP | Sales | high | no | ❌ authority: Regional Manager |
| 6 | `partner-agreement` | Channel Partner Agreement | Legal | critical | yes | ❌ discount: 20% |
| 7 | `quarterly-review-deck` | Quarterly Business Review Deck | Executive | high | yes | ❓ "current policy" |
| 8 | `data-handling-guide` | Customer Data Handling Guide | Engineering | critical | no | ❌ retention: 5 years |
| 9 | `privacy-faq` | Customer Privacy FAQ | Support | high | yes | ❌ retention: 5 years |
| 10 | `compliance-checklist` | Annual Compliance Checklist | Legal | critical | no | ✅ retention: 7 years |
| 11 | `remote-work-guide` | Employee Remote Work Guide | HR | medium | no | ❌ remote days: 5 |
| 12 | `onboarding-handbook` | New Employee Onboarding | HR | medium | no | ❌ stipend: $500 |
| 13 | `it-setup-guide` | IT Equipment Setup Guide | IT | low | no | ❌ stipend: $500 |
| 14 | `vendor-onboarding` | Vendor Onboarding Checklist | Procurement | high | no | ❌ threshold: $25,000 |
| 15 | `procurement-sop` | Procurement Standard Process | Procurement | medium | no | ✅ threshold: $10,000 |
| 16 | `security-training` | Annual Security Training | IT Security | high | no | ❌ password: 180 days |
| 17 | `security-quickstart` | Security Quick Start Guide | IT Security | medium | no | ❌ password: 180 days |
| 18 | `incident-response` | Security Incident Response Plan | IT Security | critical | no | ✅ mfa: true |
| 19 | `travel-guidelines` | Business Travel Guidelines | Finance | medium | no | ✅ per diem: $75 |
| 20 | `expense-faq` | Expense Report FAQ | Finance | low | no | ✅ hotel: $200 |
| 21 | `company-values` | Company Values & Mission | Executive | low | yes | ➖ no dependencies |
| 22 | `brand-guidelines` | Brand & Communications Guide | Marketing | medium | yes | ➖ no dependencies |
| 23 | `engineering-standards` | Engineering Code Standards | Engineering | medium | no | ➖ no dependencies |

Each document has 2–5 claims. Each claim either `depends_on` a specific `source.fact` or has `null` for no dependency.

### 2.5 — Dependencies Graph

**File:** `src/data/dependencies.json`

Pre-computed graph of every `depends_on` relationship. This is derived from the documents but stored separately for efficient traversal.

```json
[
  {
    "source_id": "discount-policy",
    "fact_key": "maximum_discount",
    "dependent_document_id": "sales-playbook",
    "dependent_claim_id": "sales-playbook.claim-1",
    "dependency_type": "direct"
  },
  ...
]
```

### 2.6 — Runtime State Files (Start Empty)

**File:** `src/data/pending_updates.json` → `[]`
**File:** `src/data/audit_log.json` → `[]`

These get populated at runtime when the LLM proposes and approves updates.

---

## Phase 3 — Knowledge Dependency Model

> **README Stage 3** · Estimated time: **45 minutes**

### 3.1 — Data Loader Service

**File:** `src/services/data-loader.service.ts`

Central service that reads/writes all JSON data files. Every other service goes through this.

```typescript
export class DataLoaderService {
  // Read operations (all data files)
  getAuthoritativeSources(): AuthoritativeSource[];
  getPreviousSources(): AuthoritativeSource[];
  getDocuments(): Document[];
  getDependencies(): Dependency[];
  getPendingUpdates(): ProposedUpdate[];
  getAuditLog(): AuditEntry[];

  // Write operations (only for remediation + audit)
  savePendingUpdates(updates: ProposedUpdate[]): void;
  saveAuditLog(entries: AuditEntry[]): void;
  updateDocument(docId: string, claimId: string, newText: string): void;
}
```

**Key detail:** Uses `import.meta.url` or `__dirname` equivalent to resolve `src/data/*.json` paths. All reads are synchronous via `fs.readFileSync` for simplicity (hackathon).

### 3.2 — Dependency Service

**File:** `src/services/dependency.service.ts`

Traverses the dependency graph to answer: "What depends on this fact?"

```typescript
export class DependencyService {
  constructor(private dataLoader: DataLoaderService) {}

  // Given a source + fact, return all dependent documents & claims
  findAffectedKnowledge(sourceId: string, factKey: string): AffectedKnowledge;

  // Given a document, return what authoritative sources it depends on
  findDocumentDependencies(documentId: string): DocumentDependency[];

  // Get full dependency tree for a source (all facts, all dependents)
  getFullDependencyTree(sourceId: string): DependencyTree;
}
```

**Supports both direct and indirect dependencies:**
- **Direct:** Document claim explicitly references `source.fact`
- **Indirect:** Document A references source S, Document B references Document A (if we model doc-to-doc deps)

For the hackathon, **direct dependencies are sufficient**. Indirect is a bonus.

---

## Phase 4 — Core MCP Tools (Detection & Traversal)

> **README Stages 4–5** · Estimated time: **1.5 hours**

### 4.1 — Module Registration

**File:** `src/modules/knowledge/knowledge.module.ts`

```typescript
import { Module } from '@nitrostack/core';
import { KnowledgeTools } from './knowledge.tools.js';
import { KnowledgeResources } from './knowledge.resources.js';
import { KnowledgePrompts } from './knowledge.prompts.js';

@Module({
  name: 'knowledge-integrity',
  description: 'Enterprise knowledge integrity — change detection, dependency traversal, conflict detection, risk scoring, remediation, and audit.',
  controllers: [KnowledgeTools, KnowledgeResources, KnowledgePrompts]
})
export class KnowledgeIntegrityModule {}
```

### 4.2 — Tool 1: `detect_source_changes`

**What it does:** Compares the current authoritative sources against the previous version and reports what facts changed.

```typescript
@Tool({
  name: 'detect_source_changes',
  description: 'Detect which authoritative facts have changed between the previous and current version of a source. This is the starting point of a knowledge integrity investigation.',
  inputSchema: z.object({
    source_id: z.string().optional()
      .describe('Specific source ID to check. If omitted, checks ALL sources.')
  })
})
async detectSourceChanges(input: any, ctx: ExecutionContext) {
  // Compare authoritative_sources.json vs authoritative_sources_v1.json
  // Return array of FactChange objects
}
```

**Example output:**

```json
{
  "total_sources_checked": 6,
  "sources_with_changes": 4,
  "changes": [
    {
      "source_id": "discount-policy",
      "source_title": "Enterprise Discount Policy",
      "fact_key": "maximum_discount",
      "old_value": "20%",
      "new_value": "10%",
      "changed": true
    },
    {
      "source_id": "discount-policy",
      "source_title": "Enterprise Discount Policy",
      "fact_key": "approval_required_above",
      "old_value": "10%",
      "new_value": "5%",
      "changed": true
    }
  ]
}
```

### 4.3 — Tool 2: `find_affected_knowledge`

**What it does:** Given a source and fact that changed, traverses the dependency graph and returns every document/claim that depends on it.

```typescript
@Tool({
  name: 'find_affected_knowledge',
  description: 'Traverse the knowledge dependency graph to find all documents and claims that depend on a specific authoritative fact. Returns both direct and indirect dependencies.',
  inputSchema: z.object({
    source_id: z.string().describe('The authoritative source ID'),
    fact_key: z.string().describe('The specific fact key within the source')
  })
})
async findAffectedKnowledge(input: any, ctx: ExecutionContext) {
  // Query dependencies.json for matching source_id + fact_key
  // Enrich with document details from documents.json
  // Return list of affected documents with their claims
}
```

**Example output:**

```json
{
  "source_id": "discount-policy",
  "fact_key": "maximum_discount",
  "current_value": "10%",
  "total_affected_documents": 4,
  "total_affected_claims": 5,
  "affected": [
    {
      "document_id": "sales-playbook",
      "document_title": "Enterprise Sales Playbook",
      "department": "Sales",
      "criticality": "critical",
      "customer_facing": true,
      "affected_claims": [
        {
          "claim_id": "sales-playbook.claim-1",
          "claim_text": "Sales can provide discounts up to 20%.",
          "section": "Pricing Guidelines"
        }
      ]
    }
  ]
}
```

### 4.4 — Service: `change-detection.service.ts`

```typescript
export class ChangeDetectionService {
  constructor(private dataLoader: DataLoaderService) {}

  detectChanges(sourceId?: string): {
    total_sources_checked: number;
    sources_with_changes: number;
    changes: FactChange[];
  };
}
```

**Logic:** For each source in `authoritative_sources.json`, find the matching source in `authoritative_sources_v1.json`. Compare every fact key/value pair. Report differences.

---

## Phase 5 — Validation & Conflict Tools

> **README Stages 6–7** · Estimated time: **1.5 hours**

### 5.1 — Tool 3: `validate_claim`

**What it does:** Checks whether a specific claim is still consistent with the authoritative fact it depends on. Returns `VALID`, `CONFLICT`, or `AMBIGUOUS`.

```typescript
@Tool({
  name: 'validate_claim',
  description: 'Validate whether a specific claim in a document is still consistent with its authoritative source. Returns VALID, CONFLICT, or AMBIGUOUS.',
  inputSchema: z.object({
    document_id: z.string().describe('The document containing the claim'),
    claim_id: z.string().describe('The specific claim ID to validate')
  })
})
```

**Validation logic (deterministic in service, semantic reasoning by LLM):**

The service does **keyword/value matching**:

| Claim Text | Authoritative Value | Result |
|-----------|-------------------|--------|
| Contains "20%" | Authoritative says "10%" | `CONFLICT` |
| Contains "10%" | Authoritative says "10%" | `VALID` |
| Contains "current policy" or "as per policy" | Any value | `AMBIGUOUS` |
| No explicit value | Any value | `AMBIGUOUS` |

The LLM calling the tool can do **deeper semantic reasoning** on the results.

### 5.2 — Tool 4: `detect_knowledge_conflicts`

**What it does:** Compares ALL claims connected to the same authoritative fact and reports which ones conflict, which are valid, and which are ambiguous.

```typescript
@Tool({
  name: 'detect_knowledge_conflicts',
  description: 'Find all knowledge contradictions across enterprise documents for a given authoritative fact. Compares every claim that depends on the fact and reports conflicts.',
  inputSchema: z.object({
    source_id: z.string().describe('The authoritative source ID'),
    fact_key: z.string().describe('The specific fact key to check conflicts for')
  })
})
```

**Example output:**

```json
{
  "source_id": "discount-policy",
  "fact_key": "maximum_discount",
  "authoritative_value": "10%",
  "total_claims_checked": 6,
  "conflicts": 3,
  "valid": 2,
  "ambiguous": 1,
  "results": [
    {
      "document_id": "sales-playbook",
      "document_title": "Enterprise Sales Playbook",
      "claim_text": "Sales can provide discounts up to 20%.",
      "status": "CONFLICT",
      "explanation": "Claim states 20% but authoritative value is 10%"
    },
    {
      "document_id": "pricing-guide",
      "document_title": "Internal Pricing Guide",
      "claim_text": "Maximum discount is capped at 10%.",
      "status": "VALID",
      "explanation": "Claim matches authoritative value of 10%"
    },
    {
      "document_id": "quarterly-review-deck",
      "document_title": "Quarterly Business Review Deck",
      "claim_text": "Discounts follow the current Enterprise Discount Policy.",
      "status": "AMBIGUOUS",
      "explanation": "References policy generically without specifying a value"
    }
  ]
}
```

### 5.3 — Service: `validation.service.ts`

```typescript
export class ValidationService {
  constructor(private dataLoader: DataLoaderService) {}

  validateClaim(documentId: string, claimId: string): ClaimValidation;
  validateAllClaimsForFact(sourceId: string, factKey: string): ClaimValidation[];
}
```

**Matching algorithm (claim text → authoritative value):**

```typescript
function determineStatus(claimText: string, authValue: string): ValidationStatus {
  const normalizedClaim = claimText.toLowerCase();
  const normalizedValue = authValue.toLowerCase();

  // Check for explicit value conflict
  // Extract numbers/percentages/values from claim text
  // Compare against authoritative value

  // If claim contains a specific value different from authoritative → CONFLICT
  // If claim contains the exact authoritative value → VALID
  // If claim references "current policy" / "as per" / no specific value → AMBIGUOUS
}
```

### 5.4 — Service: `conflict.service.ts`

```typescript
export class ConflictService {
  constructor(
    private dataLoader: DataLoaderService,
    private dependencyService: DependencyService,
    private validationService: ValidationService
  ) {}

  detectConflicts(sourceId: string, factKey: string): ConflictReport;
}
```

---

## Phase 6 — Provenance & Risk Tools

> **README Stages 8–9** · Estimated time: **1.5 hours**

### 6.1 — Tool 5: `trace_knowledge_provenance`

**What it does:** Given a claim, traces back to where the knowledge originated, through which source versions, showing whether the claim is based on current or superseded information.

```typescript
@Tool({
  name: 'trace_knowledge_provenance',
  description: 'Trace the origin of a specific claim. Shows which authoritative source it depends on, the version history of that source, and whether the claim is based on current or outdated information.',
  inputSchema: z.object({
    document_id: z.string().describe('The document containing the claim'),
    claim_id: z.string().describe('The specific claim to trace')
  })
})
```

**Example output:**

```json
{
  "claim": {
    "document_id": "sales-playbook",
    "document_title": "Enterprise Sales Playbook",
    "claim_text": "Sales can provide discounts up to 20%."
  },
  "depends_on_fact": "discount-policy.maximum_discount",
  "source_history": [
    {
      "source_id": "discount-policy",
      "source_title": "Enterprise Discount Policy",
      "version": "1.0",
      "value": "20%",
      "status": "superseded"
    },
    {
      "source_id": "discount-policy",
      "source_title": "Enterprise Discount Policy",
      "version": "2.0",
      "value": "10%",
      "status": "current"
    }
  ],
  "is_current": false,
  "conclusion": "This claim references the superseded value (20%) from version 1.0. The current authoritative value is 10% (version 2.0)."
}
```

### 6.2 — Tool 6: `assess_knowledge_risk`

**What it does:** Computes a deterministic risk score for a conflicting claim based on multiple weighted factors. The MCP server calculates the score — the LLM explains it.

```typescript
@Tool({
  name: 'assess_knowledge_risk',
  description: 'Assess the risk level of a knowledge conflict. Uses deterministic scoring based on customer-facing impact, financial impact, compliance impact, and document criticality. The server calculates the score — the LLM should explain it.',
  inputSchema: z.object({
    document_id: z.string().describe('The document with the conflict'),
    claim_id: z.string().describe('The conflicting claim')
  })
})
```

### 6.3 — Service: `risk.service.ts`

**Deterministic scoring formula:**

```typescript
function calculateRiskScore(factors: RiskFactors): number {
  let score = 0;

  if (factors.confirmed_conflict)   score += 30;  // Confirmed contradiction
  if (factors.customer_facing)      score += 25;  // Visible to customers
  if (factors.financial_impact)     score += 20;  // Could cost money
  if (factors.compliance_impact)    score += 15;  // Regulatory risk

  // Document criticality multiplier
  switch (factors.document_criticality) {
    case 'critical': score += 10; break;
    case 'high':     score += 5;  break;
    case 'medium':   score += 2;  break;
    case 'low':      score += 0;  break;
  }

  return Math.min(score, 100);
}

function riskLevel(score: number): string {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}
```

**Factor detection:**

| Factor | How It's Determined |
|--------|-------------------|
| `customer_facing` | From `document.customer_facing` field |
| `financial_impact` | Fact relates to pricing, discounts, expenses, budgets |
| `compliance_impact` | Fact relates to data retention, security, legal policies |
| `operational_impact` | Fact relates to processes, workflows, approvals |
| `confirmed_conflict` | `validate_claim` returned `CONFLICT` |
| `document_criticality` | From `document.criticality` field |

---

## Phase 7 — Remediation & Audit Tools

> **README Stages 10–11** · Estimated time: **1.5 hours**

### 7.1 — Tool 7: `propose_knowledge_update`

**What it does:** Generates a remediation proposal for a conflicting claim. Does NOT modify anything — just creates a proposal with status `AWAITING_APPROVAL`.

```typescript
@Tool({
  name: 'propose_knowledge_update',
  description: 'Generate a remediation proposal to fix a knowledge conflict. Creates a pending update with status AWAITING_APPROVAL. The update is NOT applied until explicitly approved via approve_knowledge_update.',
  inputSchema: z.object({
    document_id: z.string().describe('The document to update'),
    claim_id: z.string().describe('The conflicting claim to fix'),
    suggested_text: z.string().optional()
      .describe('Optional: custom replacement text. If omitted, auto-generates based on authoritative value.')
  })
})
```

**Example output:**

```json
{
  "proposal_id": "upd-001",
  "document_id": "sales-playbook",
  "document_title": "Enterprise Sales Playbook",
  "claim_id": "sales-playbook.claim-1",
  "current_text": "Sales can provide discounts up to 20%.",
  "suggested_text": "Sales can provide discounts up to 10%.",
  "authoritative_source": "discount-policy",
  "authoritative_fact": "maximum_discount",
  "authoritative_value": "10%",
  "risk_level": "CRITICAL",
  "status": "AWAITING_APPROVAL"
}
```

**Storage:** Written to `src/data/pending_updates.json`.

### 7.2 — Tool 8: `approve_knowledge_update`

**What it does:** Approves a pending update and applies it to the knowledge base. This is the **only tool that modifies documents**. It also writes to the audit log.

```typescript
@Tool({
  name: 'approve_knowledge_update',
  description: 'Approve and apply a pending knowledge update. This is the ONLY tool that modifies the knowledge base. Requires a valid proposal_id from propose_knowledge_update. Records the change in the audit log.',
  inputSchema: z.object({
    proposal_id: z.string().describe('The proposal ID to approve (from propose_knowledge_update)'),
    reason: z.string().optional()
      .describe('Optional: reason for approval')
  })
})
```

**What happens on approval:**
1. Find proposal in `pending_updates.json`
2. Update status to `APPROVED`
3. Modify the claim text in `documents.json`
4. Write an entry to `audit_log.json`
5. Return confirmation with audit entry

### 7.3 — Tool 9: `get_audit_log`

**What it does:** Returns the history of all approved changes.

```typescript
@Tool({
  name: 'get_audit_log',
  description: 'Retrieve the audit log of all knowledge updates that have been proposed, approved, and applied. Shows complete remediation history.',
  inputSchema: z.object({
    document_id: z.string().optional()
      .describe('Optional: filter by document ID'),
    limit: z.number().optional()
      .describe('Optional: max number of entries to return (default: 50)')
  })
})
```

### 7.4 — Services

**`src/services/remediation.service.ts`:**

```typescript
export class RemediationService {
  proposeUpdate(documentId: string, claimId: string, suggestedText?: string): ProposedUpdate;
  approveUpdate(proposalId: string, reason?: string): { update: ProposedUpdate; audit: AuditEntry };
  rejectUpdate(proposalId: string, reason?: string): ProposedUpdate;
  getPendingUpdates(): ProposedUpdate[];
}
```

**`src/services/audit.service.ts`:**

```typescript
export class AuditService {
  recordEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>): AuditEntry;
  getLog(filter?: { documentId?: string; limit?: number }): AuditEntry[];
}
```

---

## Phase 8 — High-Level Investigation Tool

> **README Stage 12** · Estimated time: **45 minutes**

### 8.1 — Optional: `investigate_knowledge_change`

A single high-level tool that runs the entire pipeline and returns a complete investigation report. This is **optional** — the README notes that letting the LLM orchestrate the individual tools is actually more impressive for the demo.

```typescript
@Tool({
  name: 'investigate_knowledge_change',
  description: 'Run a complete knowledge integrity investigation. Detects all source changes, traces dependencies, validates claims, finds conflicts, assesses risk, and proposes remediations. Returns a comprehensive report.',
  inputSchema: z.object({
    source_id: z.string().optional()
      .describe('Optional: investigate a specific source. If omitted, investigates ALL changed sources.')
  })
})
```

**Output structure:**

```json
{
  "investigation_summary": {
    "sources_checked": 6,
    "changes_detected": 7,
    "documents_affected": 12,
    "conflicts_found": 8,
    "critical_risks": 3,
    "remediations_proposed": 8
  },
  "changes": [ ... ],
  "conflicts": [ ... ],
  "risk_assessments": [ ... ],
  "proposed_remediations": [ ... ]
}
```

### 8.2 — MCP Resources

**File:** `src/modules/knowledge/knowledge.resources.ts`

Expose the knowledge base as MCP resources the LLM can browse:

```typescript
@Resource({
  uri: 'knowledge://sources',
  name: 'Authoritative Sources',
  description: 'Current authoritative enterprise sources and their facts',
  mimeType: 'application/json'
})

@Resource({
  uri: 'knowledge://documents',
  name: 'Enterprise Documents',
  description: 'All enterprise documents with their claims and dependencies',
  mimeType: 'application/json'
})

@Resource({
  uri: 'knowledge://pending-updates',
  name: 'Pending Updates',
  description: 'Knowledge update proposals awaiting approval',
  mimeType: 'application/json'
})
```

### 8.3 — MCP Prompts

**File:** `src/modules/knowledge/knowledge.prompts.ts`

```typescript
@Prompt({
  name: 'investigate_policy_change',
  description: 'Investigate the impact of a policy change on enterprise knowledge',
  arguments: [
    { name: 'policy', description: 'The policy or source that changed', required: false }
  ]
})
// Returns conversation template guiding the LLM to use the tools in sequence

@Prompt({
  name: 'knowledge_health_check',
  description: 'Run a full health check on enterprise knowledge consistency',
  arguments: []
})
// Returns template for comprehensive knowledge audit
```

---

## Phase 9 — MCP Client Connection & Demo

> **README Stage 13** · Estimated time: **1 hour**

### 9.1 — Test with NitroStudio

1. Run `npm run dev`
2. Open NitroStudio (the recommended client from the template README)
3. Verify all 9 tools appear in the tools list
4. Test each tool individually with sample inputs

### 9.2 — Test with Claude Desktop (if available)

Add to Claude Desktop's MCP config:

```json
{
  "mcpServers": {
    "knowledge-integrity": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/my-mcp-server"
    }
  }
}
```

### 9.3 — Demo Flow

**The user says:**

> "Has any important company knowledge become invalid after the latest policy changes?"

**The LLM should chain these calls:**

```
detect_source_changes()
        ↓                    "4 sources changed, 7 fact changes detected"
find_affected_knowledge()
        ↓                    "12 documents affected, 15 claims to check"
detect_knowledge_conflicts()
        ↓                    "8 conflicts, 5 valid, 2 ambiguous"
assess_knowledge_risk()
        ↓                    "3 CRITICAL, 3 HIGH, 2 MEDIUM"
trace_knowledge_provenance()
        ↓                    "Claims trace to superseded policy v1"
```

**LLM responds:**

> "The Enterprise Discount Policy changed from 20% to 10%. I found 4 dependent documents. 3 contain confirmed contradictions. The Sales Proposal Template is CRITICAL because it is customer-facing and financially sensitive."

**User says:** "Fix the critical ones."

```
propose_knowledge_update()   × 3 (one per critical conflict)
        ↓                    "3 proposals created, AWAITING_APPROVAL"
```

**LLM responds:**

> "I've proposed 3 updates. Here they are for your review: [list]. Shall I apply them?"

**User says:** "Yes, approve them."

```
approve_knowledge_update()   × 3
        ↓                    "3 updates applied, audit entries recorded"
get_audit_log()
        ↓                    "Shows complete change history"
```

### 9.4 — Verification Checklist

- [ ] `npm run dev` starts without errors
- [ ] All 9 tools are discoverable via MCP
- [ ] `detect_source_changes()` returns 7 fact changes across 4 sources
- [ ] `find_affected_knowledge("discount-policy", "maximum_discount")` returns 4+ documents
- [ ] `validate_claim()` correctly returns VALID, CONFLICT, or AMBIGUOUS
- [ ] `detect_knowledge_conflicts()` shows correct per-claim breakdown
- [ ] `trace_knowledge_provenance()` shows v1 → v2 version chain
- [ ] `assess_knowledge_risk()` returns deterministic scores (not AI-hallucinated)
- [ ] `propose_knowledge_update()` creates entry in `pending_updates.json`
- [ ] `approve_knowledge_update()` modifies `documents.json` and writes to `audit_log.json`
- [ ] `get_audit_log()` shows complete history
- [ ] Full demo flow works end-to-end via MCP client
- [ ] Health check passes

---

## File Map

```
src/
├── index.ts                                    # KEEP — no changes
├── app.module.ts                               # MODIFY — swap calculator → knowledge
│
├── health/
│   └── system.health.ts                        # KEEP — no changes
│
├── types/
│   └── index.ts                                # NEW — all TypeScript interfaces
│
├── data/
│   ├── authoritative_sources.json              # NEW — current truth (v2)
│   ├── authoritative_sources_v1.json           # NEW — previous truth (v1)
│   ├── documents.json                          # NEW — 20+ enterprise documents
│   ├── dependencies.json                       # NEW — fact → claim graph
│   ├── pending_updates.json                    # NEW — starts as []
│   └── audit_log.json                          # NEW — starts as []
│
├── services/
│   ├── data-loader.service.ts                  # NEW — JSON read/write
│   ├── change-detection.service.ts             # NEW — v1 vs v2 comparison
│   ├── dependency.service.ts                   # NEW — graph traversal
│   ├── validation.service.ts                   # NEW — claim validation
│   ├── conflict.service.ts                     # NEW — cross-doc contradiction detection
│   ├── provenance.service.ts                   # NEW — knowledge origin tracing
│   ├── risk.service.ts                         # NEW — deterministic risk scoring
│   ├── remediation.service.ts                  # NEW — propose/approve updates
│   └── audit.service.ts                        # NEW — change history recording
│
├── modules/
│   └── knowledge/
│       ├── knowledge.module.ts                 # NEW — module registration
│       ├── knowledge.tools.ts                  # NEW — all 9 MCP tools
│       ├── knowledge.resources.ts              # NEW — 3 MCP resources
│       └── knowledge.prompts.ts                # NEW — 2 MCP prompts
│
└── widgets/                                    # KEEP — optional, not in scope for MVP
```

**New files to create:** 22
**Files to modify:** 1 (`app.module.ts`)
**Files to delete:** 4 (calculator module)

---

## Complete Tool Reference

| # | MCP Tool | Input | Output | Phase |
|---|----------|-------|--------|-------|
| 1 | `detect_source_changes` | `source_id?` | Changed facts with old/new values | Phase 4 |
| 2 | `find_affected_knowledge` | `source_id`, `fact_key` | Documents & claims that depend on the fact | Phase 4 |
| 3 | `validate_claim` | `document_id`, `claim_id` | VALID / CONFLICT / AMBIGUOUS | Phase 5 |
| 4 | `detect_knowledge_conflicts` | `source_id`, `fact_key` | All claims compared, grouped by status | Phase 5 |
| 5 | `trace_knowledge_provenance` | `document_id`, `claim_id` | Source version history, current vs superseded | Phase 6 |
| 6 | `assess_knowledge_risk` | `document_id`, `claim_id` | Risk score (0–100), level, reasons | Phase 6 |
| 7 | `propose_knowledge_update` | `document_id`, `claim_id`, `suggested_text?` | Proposal with AWAITING_APPROVAL status | Phase 7 |
| 8 | `approve_knowledge_update` | `proposal_id`, `reason?` | Applied update + audit entry | Phase 7 |
| 9 | `get_audit_log` | `document_id?`, `limit?` | Change history entries | Phase 7 |

**Optional:**

| # | MCP Tool | Input | Output | Phase |
|---|----------|-------|--------|-------|
| 10 | `investigate_knowledge_change` | `source_id?` | Full pipeline report | Phase 8 |

---

## Demo Script

### Opening (30 seconds)

> "Enterprise knowledge becomes outdated the moment a policy changes. Sales teams quote wrong discounts. Training materials teach wrong processes. Compliance docs reference old rules. Nobody knows until something breaks."

### Problem Statement (30 seconds)

> "When the Enterprise Discount Policy changed from 20% to 10%, how many documents across the company still say 20%? Today, nobody knows. It takes weeks of manual auditing — if it happens at all."

### Live Demo (3–4 minutes)

**Step 1:** *"Let's find what changed."*
→ `detect_source_changes()` — shows 7 fact changes across 4 policies

**Step 2:** *"What depends on the discount policy?"*
→ `find_affected_knowledge("discount-policy", "maximum_discount")` — shows 4 affected documents

**Step 3:** *"Are they still accurate?"*
→ `detect_knowledge_conflicts("discount-policy", "maximum_discount")` — shows 3 conflicts, 2 valid, 1 ambiguous

**Step 4:** *"How dangerous is this?"*
→ `assess_knowledge_risk("sales-playbook", "sales-playbook.claim-1")` — CRITICAL: customer-facing, financial impact, confirmed conflict

**Step 5:** *"Where did this bad info come from?"*
→ `trace_knowledge_provenance("sales-playbook", "sales-playbook.claim-1")` — traces to Policy v1, superseded by v2

**Step 6:** *"Fix the critical ones."*
→ `propose_knowledge_update()` × 3 — proposals created, AWAITING_APPROVAL
→ `approve_knowledge_update()` × 3 — updates applied

**Step 7:** *"Show me the audit trail."*
→ `get_audit_log()` — complete change history with timestamps

### Closing (30 seconds)

> "Something changed → what depends on it → what is now wrong → why it's dangerous → what should change → approve → fix → record. That's the complete enterprise knowledge integrity loop, powered by MCP."

---

## Estimated Timeline

| Phase | Task | Time |
|-------|------|------|
| **Phase 1** | Scaffolding — delete calculator, set up dirs, update app module | 30 min |
| **Phase 2** | Synthetic data — types, 6 JSON files, 20+ documents | 1–1.5 hrs |
| **Phase 3** | Data loader + dependency service | 45 min |
| **Phase 4** | Tools 1–2: detect changes, find affected | 1.5 hrs |
| **Phase 5** | Tools 3–4: validate claims, detect conflicts | 1.5 hrs |
| **Phase 6** | Tools 5–6: provenance, risk scoring | 1.5 hrs |
| **Phase 7** | Tools 7–9: propose, approve, audit | 1.5 hrs |
| **Phase 8** | High-level investigation tool + resources + prompts | 45 min |
| **Phase 9** | Client connection, testing, demo prep | 1 hr |
| **Total** | | **~10 hours** |

> **Key principle:** No external APIs. No databases. No frontend. Just a clean MCP server with synthetic JSON data that any LLM can connect to and reason over. The entire demo proves the MCP concept through visible tool orchestration.
