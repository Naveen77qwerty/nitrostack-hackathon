// Enterprise Knowledge Integrity Services — Phases 3–6
export { DataLoaderService } from './data-loader.service.js';
export { KnowledgeDataError, KnowledgeInputError } from './data-loader.service.js';
export { DependencyService } from './dependency.service.js';
export { ChangeDetectionService } from './change-detection.service.js';
export type { ChangeDetectionResult } from './change-detection.service.js';
export { ValidationService, determineStatus } from './validation.service.js';
export { ConflictService } from './conflict.service.js';
export { ProvenanceService } from './provenance.service.js';
export { RiskService, calculateRiskScore, riskLevel } from './risk.service.js';
export { AuditService } from './audit.service.js';
export { RemediationService } from './remediation.service.js';
export type { ProposedUpdateRequest } from './remediation.service.js';

// Phase 10 — New services for production workflows
export { DriftService } from './drift.service.js';
export type { DriftSummary, SourceDrift } from './drift.service.js';
export { ReportService } from './report.service.js';
export type { ComplianceReport, DepartmentHealth } from './report.service.js';
export { BatchService } from './batch.service.js';
export type { BatchApproveResult } from './batch.service.js';

