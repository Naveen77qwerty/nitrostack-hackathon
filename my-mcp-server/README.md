The core should be:

LLM → MCP Server → detect changed facts → trace dependent knowledge → find contradictions → assess risk → propose remediation → human approval → update → audit.

Stage 1 — Initialize the TypeScript MCP Server

Create the project with the TypeScript MCP SDK.

Basic structure:

knowledge-integrity-mcp/
│
├── src/
│   ├── index.ts
│   ├── tools/
│   ├── services/
│   ├── data/
│   └── types/
│
├── package.json
├── tsconfig.json
└── README.md

The server should expose MCP tools that ChatGPT/Claude can discover and call.

Don't build frontend, authentication, production databases, or external integrations for the MVP.

Stage 2 — Create Synthetic Enterprise Knowledge

Create a small mock enterprise knowledge base.

Use JSON files.

Authoritative sources
authoritative_sources.json

Example:

{
  "id": "discount-policy",
  "version": "2.0",
  "facts": {
    "maximum_discount": "10%"
  }
}
Enterprise documents
documents.json

Have roughly 15–25 documents containing:

correct information
outdated information
ambiguous information
unrelated information

Example:

{
  "id": "sales-playbook",
  "title": "Enterprise Sales Playbook",
  "department": "Sales",
  "claims": [
    {
      "text": "Sales can provide discounts up to 20%.",
      "depends_on": "discount-policy.maximum_discount"
    }
  ]
}

This becomes your controlled demo environment.

Stage 3 — Define the Knowledge Dependency Model

This is the technical foundation.

Represent:

Authoritative Source
        ↓
       Fact
        ↓
      Claim
        ↓
     Document
        ↓
    Department

Example:

Enterprise Discount Policy
          ↓
Maximum Discount
          ↓
      ┌───┴────┐
      ↓        ↓
Sales Guide  Proposal Template
      ↓
 Sales Team

You don't need Neo4j.

For the hackathon, TypeScript objects/JSON are enough.

The important thing is that your MCP server can traverse these relationships.

Stage 4 — Implement Source Change Detection

The server needs to understand:

Previous authoritative state

maximum_discount = 20%

            ↓

Current authoritative state

maximum_discount = 10%

Implement the underlying comparison logic.

Expose an MCP tool such as:

detect_source_changes

Input:

source_id

Output:

{
  "changed": true,
  "fact": "maximum_discount",
  "old_value": "20%",
  "new_value": "10%"
}

This starts the investigation.

Stage 5 — Implement Dependency Discovery

Create the MCP tool:

find_affected_knowledge

Input:

source_id
fact_id

It should traverse the dependency data and return every claim/document potentially affected.

For example:

maximum_discount changed

Affected:

Sales Playbook
Proposal Template
Pricing Guide
Sales Training Guide

Support direct and indirect dependencies if possible.

This is one of your most important features.

Stage 6 — Implement Fact-Level Validation

Don't mark entire documents outdated.

Validate individual claims.

Create:

validate_claim

Input:

claim
authoritative_fact

Return:

VALID
CONFLICT
AMBIGUOUS

For example:

Authoritative:

Maximum discount = 10%

Claim:

"Sales can provide discounts up to 20%."

Result:

CONFLICT

But:

"Discounts must follow the current
Enterprise Discount Policy."

Result:

VALID

This is where the connected LLM can provide semantic reasoning.

Stage 7 — Implement Contradiction Detection

Create:

detect_knowledge_conflicts

It should compare claims connected to the same authoritative fact.

Example result:

Authoritative truth:
10%

Sales Playbook:
20% → CONFLICT

Pricing Guide:
10% → VALID

Proposal Template:
20% → CONFLICT

Training Guide:
current policy → VALID

This demonstrates that the MCP isn't just finding old files.

It's checking enterprise knowledge consistency.

Stage 8 — Implement Knowledge Provenance

Create:

trace_knowledge_provenance

Given a claim, return where it came from.

Example:

Sales Playbook
      ↓
"Maximum discount = 20%"
      ↓
Enterprise Discount Policy v1
      ↓
Superseded by
      ↓
Enterprise Discount Policy v2
      ↓
Maximum discount = 10%

This gives the LLM evidence for its conclusions.

Stage 9 — Implement Risk Prioritization

Create:

assess_knowledge_risk

Don't let the LLM arbitrarily invent the score.

Use deterministic factors such as:

customer_facing
financial_impact
compliance_impact
operational_impact
confirmed_conflict
document_criticality

Return something like:

{
  "risk": "CRITICAL",
  "score": 87,
  "reasons": [
    "Customer-facing information",
    "Financial impact",
    "Confirmed contradiction"
  ]
}

The LLM can explain the result, but your MCP server calculates it.

Stage 10 — Implement Remediation

Create:

propose_knowledge_update

It should return:

Document:
Sales Playbook

Problem:
Maximum discount says 20%

Current authoritative value:
10%

Suggested update:
Replace 20% with 10%

Status:
AWAITING_APPROVAL

Then expose a separate tool:

approve_knowledge_update

Only this tool should actually modify the mock knowledge base.

That gives you:

AI proposes → Human approves → MCP executes.

Stage 11 — Implement Audit Trail

Every approved change should be recorded.

Create:

get_audit_log

Store:

document
claim
old_value
new_value
authoritative_source
reason
risk
timestamp

This makes the system much more enterprise credible.

Stage 12 — Add One High-Level Investigation Tool

Your low-level tools demonstrate MCP capabilities.

But also expose something like:

investigate_knowledge_change

This returns the information needed for the client/LLM to understand the investigation:

Source changed
      ↓
Facts changed
      ↓
Dependencies found
      ↓
Claims affected
      ↓
Conflicts
      ↓
Risk
      ↓
Recommended remediation

Alternatively, let the connected LLM orchestrate the low-level tools itself. For the hackathon, this is actually more impressive if the MCP client visibly makes multiple tool calls.

Stage 13 — Connect an MCP Client

Build the server, then connect a compatible MCP client over STDIO:

```bash
npm run build
```

For NitroStudio, run `npm run dev`, select the project, and confirm the nine
core tools plus the optional `investigate_knowledge_change` tool are listed.
For Claude Desktop, copy [examples/claude-desktop.config.json](examples/claude-desktop.config.json)
into its MCP configuration and replace the `cwd` placeholder with this project’s
absolute path. Restart Claude Desktop after saving the configuration.

The production connection is verified locally with:

```bash
npm run test:phase9
```

That test starts `dist/index.js` as a standard MCP STDIO server, uses the
official MCP client SDK to discover all tools, resources, and prompts, and
calls `detect_source_changes` without modifying knowledge data.

The ideal demo is:

Claude / ChatGPT / MCP Client
              │
              │ MCP
              ▼
    Knowledge Integrity MCP
              │
       ┌──────┼───────┐
       ▼      ▼       ▼
    Sources  Claims  Dependencies
              │
              ▼
          Audit Data

Then the user asks:

"Has any important company knowledge become invalid after the latest policy change?"

The LLM should discover your tools and perform something like:

detect_source_changes()

        ↓

find_affected_knowledge()

        ↓

validate_claim()

        ↓

detect_knowledge_conflicts()

        ↓

assess_knowledge_risk()

        ↓

trace_knowledge_provenance()

The precise counts are derived from the synthetic data at runtime. The client
should summarize the returned evidence, for example:

"The Enterprise Discount Policy changed from 20% to 10%. I found dependent documents with confirmed contradictions. The Sales Proposal Template is critical because it is customer-facing and financially sensitive."

Then:

"Fix the critical ones."

Only `approve_knowledge_update` modifies documents. `propose_knowledge_update`
creates reviewable entries with `AWAITING_APPROVAL` status.

It returns proposed changes requiring approval.

After approval:

approve_knowledge_update()

Then:

get_audit_log()

That's your complete demo.

Final MCP Tool Set

Don't overload the server. I'd ship approximately these tools:

MCP Tool	Purpose
detect_source_changes	Find authoritative facts that changed
find_affected_knowledge	Traverse dependencies
validate_claim	Check whether a claim is still valid
detect_knowledge_conflicts	Find contradictory enterprise knowledge
trace_knowledge_provenance	Explain where knowledge originated
assess_knowledge_risk	Prioritize dangerous conflicts
propose_knowledge_update	Generate remediation proposal
approve_knowledge_update	Apply approved correction
get_audit_log	Show remediation history

Your architecture stays very small:

ChatGPT / Claude / MCP Client
              │
             MCP
              │
              ▼
┌─────────────────────────────┐
│ Enterprise Knowledge       │
│ Integrity MCP — TypeScript │
│                             │
│ Change Detection            │
│ Dependency Traversal        │
│ Claim Validation            │
│ Conflict Detection          │
│ Provenance                  │
│ Risk Engine                 │
│ Remediation                 │
│ Audit                       │
└──────────────┬──────────────┘
               │
               ▼
      Synthetic Enterprise
          Knowledge Base

The most important thing is not the number of tools. The demo needs to prove that an arbitrary MCP-compatible LLM can connect to your server and use these tools to reason:

"Something changed → what knowledge depends on it → what is now wrong → why is it dangerous → what should change → approve → fix → record."
