import { Module } from '@nitrostack/core';
import { KnowledgeTools } from './knowledge.tools.js';
import { KnowledgeResources } from './knowledge.resources.js';
import { KnowledgePrompts } from './knowledge.prompts.js';
import { DataLoaderService } from '../../services/data-loader.service.js';
import { DependencyService } from '../../services/dependency.service.js';
import { ChangeDetectionService } from '../../services/change-detection.service.js';
import { ValidationService } from '../../services/validation.service.js';
import { ConflictService } from '../../services/conflict.service.js';
import { ProvenanceService } from '../../services/provenance.service.js';
import { RiskService } from '../../services/risk.service.js';

@Module({
  name: 'knowledge-integrity',
  description: 'Enterprise knowledge integrity — change detection, dependency traversal, conflict detection, risk scoring, remediation, and audit.',
  controllers: [KnowledgeTools, KnowledgeResources, KnowledgePrompts],
  providers: [
    DataLoaderService,
    DependencyService,
    ChangeDetectionService,
    ValidationService,
    ConflictService,
    ProvenanceService,
    RiskService,
  ],
  exports: [
    DataLoaderService,
    DependencyService,
    ChangeDetectionService,
    ValidationService,
    ConflictService,
    ProvenanceService,
    RiskService,
  ],
})
export class KnowledgeIntegrityModule {}
