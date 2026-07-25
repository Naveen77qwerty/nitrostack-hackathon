import {
  ExecutionContext,
  Injectable,
  PromptDecorator as Prompt,
} from '@nitrostack/core';
import {
  DataLoaderService,
  KnowledgeInputError,
} from '../../services/data-loader.service.js';

/** MCP prompt templates that guide a client through the established tool flow. */
@Injectable({ deps: [DataLoaderService] })
export class KnowledgePrompts {
  constructor(private readonly dataLoader: DataLoaderService) {}

  @Prompt({
    name: 'investigate_policy_change',
    description: 'Investigate the impact of a policy change on enterprise knowledge',
    arguments: [
      {
        name: 'policy',
        description: 'The policy or source that changed',
        required: false,
      },
    ],
  })
  async investigatePolicyChange(
    args: { policy?: string },
    _ctx: ExecutionContext,
  ) {
    const policy = args.policy?.trim();
    const source = policy ? this.resolveSource(policy) : undefined;
    const scope = source
      ? `Focus on authoritative source ID \`${source.id}\`. First call detect_source_changes with source_id set to \`${source.id}\`.`
      : 'Start by identifying every changed authoritative source.';

    return [
      {
        role: 'user' as const,
        content: `${scope}\n\nInvestigate its impact using the knowledge-integrity MCP tools. First call detect_source_changes. For each changed fact, call find_affected_knowledge and detect_knowledge_conflicts. For every confirmed conflict, call assess_knowledge_risk and trace_knowledge_provenance. Summarize the evidence, prioritizing CRITICAL and HIGH risks. Only call propose_knowledge_update after presenting the proposed change for review; do not call approve_knowledge_update unless the user explicitly approves it.`,
      },
    ];
  }

  @Prompt({
    name: 'knowledge_health_check',
    description: 'Run a full health check on enterprise knowledge consistency',
    arguments: [],
  })
  async knowledgeHealthCheck(_args: Record<string, never>, _ctx: ExecutionContext) {
    return [
      {
        role: 'user' as const,
        content: 'Run a comprehensive enterprise knowledge health check. Call detect_source_changes with no source_id. For every changed fact, use find_affected_knowledge and detect_knowledge_conflicts, then assess_knowledge_risk for each confirmed conflict. Trace provenance for the highest-risk claims. Report the number of changed facts, affected documents, conflicts by status, risk levels, and recommended remediations. Do not apply any update without explicit user approval.',
      },
    ];
  }

  private resolveSource(policy: string) {
    const normalized = policy.toLowerCase();
    const source = this.dataLoader.getAuthoritativeSources().find(
      (candidate) =>
        candidate.id.toLowerCase() === normalized ||
        candidate.title.toLowerCase() === normalized,
    );
    if (!source) {
      throw new KnowledgeInputError(
        `Unknown authoritative source: ${policy}`,
      );
    }
    return source;
  }
}
