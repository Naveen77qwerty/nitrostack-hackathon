import { Module } from '@nitrostack/core';
import { KnowledgeTools } from './knowledge.tools.js';
import { KnowledgeResources } from './knowledge.resources.js';
import { KnowledgePrompts } from './knowledge.prompts.js';
import { DataLoaderService } from '../../services/data-loader.service.js';
import { DependencyService } from '../../services/dependency.service.js';

@Module({
  name: 'knowledge-integrity',
  description: 'Enterprise knowledge integrity — change detection, dependency traversal, conflict detection, risk scoring, remediation, and audit.',
  controllers: [KnowledgeTools, KnowledgeResources, KnowledgePrompts],
  providers: [DataLoaderService, DependencyService],
  exports: [DataLoaderService, DependencyService],
})
export class KnowledgeIntegrityModule {}
