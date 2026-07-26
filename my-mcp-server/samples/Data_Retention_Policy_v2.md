# Information Data Retention & Lifecycle Policy (v2.0)
**Effective Date:** May 15, 2026  
**Department:** Legal & Compliance  
**Classification:** Internal Confidential  
**Document Owner:** Chief Legal Officer  

---

## 1. Governance & Purpose

This policy governs the mandatory holding periods, backup schedules, and destruction standards for customer data, operational logs, and corporate communications.

---

## 2. Mandatory Fact Parameters

### 2.1 Retention Mandate (`retention_period`)
- **Authoritative Fact:** `retention_period`
- **Value:** `7 years`
- **Policy Statement:** All customer transaction logs, audit trails, and privacy request records must be retained for a minimum period of **7 years** to satisfy global regulatory compliance (EU GDPR & US Sarbanes-Oxley). (Previously 5 years in v1.0).

### 2.2 Certified Deletion Protocol (`deletion_method`)
- **Authoritative Fact:** `deletion_method`
- **Value:** `certified destruction`
- **Policy Statement:** Upon expiration of the 7-year retention period, storage media must undergo **certified destruction** with verifiable cryptographic destruction certificates.

### 2.3 Disaster Recovery Schedule (`backup_frequency`)
- **Authoritative Fact:** `backup_frequency`
- **Value:** `daily`
- **Policy Statement:** Primary data stores must undergo encrypted immutable backups on a **daily** schedule.
