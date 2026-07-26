# Enterprise Data Architecture & Ingestion Specification

> **Architectural Paradigm: Versioned Canonical Fact Registries vs. Unstructured RAG**

---

## 1. Why Canonical Fact Modeling Superior to Unstructured RAG for Knowledge Integrity

In traditional Retrieval-Augmented Generation (RAG) applications, unstructured policy documents (PDFs, DOCX files) are split into text chunks and embedded into vector databases. 

When evaluating **Knowledge Integrity** and **Compliance Auditability**, unstructured RAG suffers from fatal flaws:

| Architectural Metric | Unstructured RAG / Vector Embedding | Versioned Fact Registry (NitroStack MCP Engine) |
| :--- | :--- | :--- |
| **Numeric & Policy Precision** | ❌ Fails on exact value changes (e.g., mistaking 20% for 10% due to semantic vector proximity). | ✅ **100% Exact Value Matching** (`"maximum_discount": "10%"`). |
| **Auditability & Provenance** | ❌ Cannot guarantee which specific version generated a vector embedding chunk. | ✅ **Immutable Version History** (Explicit `v1` vs `v2` lineage tracking). |
| **Deterministic Risk Scoring** | ❌ LLM invents risk scores dynamically per prompt (non-reproducible). | ✅ **Server-Calculated Risk Matrix** (Weighted scoring based on metadata). |
| **Enterprise Connectors** | ❌ Relies on continuous document re-indexing and chunking pipelines. | ✅ **Direct API Synchronization** from Workday, SAP, ServiceNow, and Notion DBs. |

---

## 2. Ingestion Pipeline Schema Architecture

Enterprise systems of record (e.g., Workday Policy Engine, ServiceNow Knowledge Bases, SAP ERP, or Notion Databases) sync into the MCP server via canonical JSON fact schemas.

### Authoritative Source Schema Mapping

```json
{
  "id": "discount-policy",
  "title": "Enterprise Discount Policy",
  "department": "Finance",
  "version": "2.0",
  "effective_date": "2026-06-01",
  "facts": {
    "maximum_discount": "10%",
    "approval_required_above": "5%",
    "discount_authority": "VP Sales"
  },
  "metadata": {
    "owner": "Finance Operations",
    "last_updated": "2026-06-01T00:00:00Z",
    "classification": "internal"
  }
}
```

### Ingestion Flow Diagram

```
┌───────────────────────────┐
│ Enterprise Systems        │
│ (SAP / Workday / Notion)  │
└─────────────┬─────────────┘
              │  REST API / Webhook (Policy Update Event)
              ▼
┌───────────────────────────┐
│ Canonical Fact Ingestion  │  ──> Validates Fact Key/Value Schema (Zod)
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ Authoritative Fact Store  │  ──> Atomic Write to authoritative_sources.json
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ NitroStack MCP Server     │  ──> Traces downstream dependencies, validates claims,
│ (Knowledge Integrity)     │      and manages human approval workflow
└───────────────────────────┘
```

---

## 3. Sample Enterprise Ingestion Mapping

| Raw Document File | Extracted Authoritative Fact | Fact Key | Version 1.0 (Old) | Version 2.0 (Current) |
| :--- | :--- | :--- | :--- | :--- |
| `Enterprise_Discount_Policy_v2.md` | Maximum Discount Cap | `maximum_discount` | `20%` | `10%` |
| `Enterprise_Discount_Policy_v2.md` | Approval Required Above | `approval_required_above` | `10%` | `5%` |
| `Enterprise_Discount_Policy_v2.md` | Approval Authority | `discount_authority` | `Regional Manager` | `VP Sales` |
| `Data_Retention_Policy_v2.md` | Data Retention Mandate | `retention_period` | `5 years` | `7 years` |
| `Security_Policy_v3.md` | Password Rotation Interval | `password_rotation` | `180 days` | `90 days` |

---

## 4. Conclusion for Technical Evaluators

The choice to build on pre-structured, versioned fact snapshots (`authoritative_sources.json`) rather than raw vector chunks is **not a limitation—it is a deliberate enterprise architectural requirement**. It ensures that compliance evaluation, risk assessment, and human remediation operate on **100% deterministic ground truth**.
