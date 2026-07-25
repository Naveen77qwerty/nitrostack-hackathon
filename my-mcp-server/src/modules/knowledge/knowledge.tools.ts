import { ToolDecorator as Tool, ExecutionContext, z, Injectable } from '@nitrostack/core';
import { ChangeDetectionService } from '../../services/change-detection.service.js';
import { DependencyService } from '../../services/dependency.service.js';

// ---------------------------------------------------------------------------
// KnowledgeTools — MCP tool controller (Phase 4)
// ---------------------------------------------------------------------------
// Exposes the first two core tools of the Enterprise Knowledge Integrity
// server: change detection and dependency traversal.  Future phases will
// add additional tools to this same controller.
// ---------------------------------------------------------------------------

@Injectable({ deps: [ChangeDetectionService, DependencyService] })
export class KnowledgeTools {
  constructor(
    private readonly changeDetection: ChangeDetectionService,
    private readonly dependencyService: DependencyService,
  ) {}

  // ── Tool 1: detect_source_changes ───────────────────────────────────────

  /**
   * Detect which authoritative facts have changed between the previous and
   * current version of a source.  This is the starting point of a knowledge
   * integrity investigation.
   *
   * When `source_id` is provided only that source is inspected; otherwise
   * every source is checked.
   */
  @Tool({
    name: 'detect_source_changes',
    description:
      'Detect which authoritative facts have changed between the previous and current version of a source. This is the starting point of a knowledge integrity investigation.',
    inputSchema: z.object({
      source_id: z
        .string()
        .min(1)
        .optional()
        .describe(
          'Specific source ID to check (e.g. "discount-policy"). If omitted, checks ALL sources.',
        ),
    }),
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
    },
    invocation: {
      invoking: 'Comparing authoritative source versions…',
      invoked: 'Source change detection complete.',
    },
  })
  async detectSourceChanges(
    input: { source_id?: string },
    ctx: ExecutionContext,
  ) {
    ctx.logger.info('Running detect_source_changes', {
      source_id: input.source_id ?? '(all)',
    });

    const result = this.changeDetection.detectChanges(input.source_id);

    return {
      total_sources_checked: result.total_sources_checked,
      sources_with_changes: result.sources_with_changes,
      changes: result.changes,
    };
  }

  // ── Tool 2: find_affected_knowledge ─────────────────────────────────────

  /**
   * Traverse the knowledge dependency graph to find every document and claim
   * that depends on a specific authoritative fact.
   */
  @Tool({
    name: 'find_affected_knowledge',
    description:
      'Traverse the knowledge dependency graph to find all documents and claims that depend on a specific authoritative fact. Returns both direct and indirect dependencies.',
    inputSchema: z.object({
      source_id: z
        .string()
        .min(1)
        .describe('The authoritative source ID (e.g. "discount-policy")'),
      fact_key: z
        .string()
        .min(1)
        .describe('The specific fact key within the source (e.g. "maximum_discount")'),
    }),
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
    },
    invocation: {
      invoking: 'Traversing knowledge dependency graph…',
      invoked: 'Dependency traversal complete.',
    },
  })
  async findAffectedKnowledge(
    input: { source_id: string; fact_key: string },
    ctx: ExecutionContext,
  ) {
    ctx.logger.info('Running find_affected_knowledge', {
      source_id: input.source_id,
      fact_key: input.fact_key,
    });

    const result = this.dependencyService.findAffectedKnowledge(
      input.source_id,
      input.fact_key,
    );

    return result;
  }
}
