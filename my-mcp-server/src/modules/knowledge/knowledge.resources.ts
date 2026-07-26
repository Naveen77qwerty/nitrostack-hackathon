import {
  ExecutionContext,
  Injectable,
  ResourceDecorator as Resource,
} from '@nitrostack/core';
import { DataLoaderService } from '../../services/data-loader.service.js';
import { AuditService } from '../../services/audit.service.js';

/** Read-only MCP resources for browsing the enterprise knowledge base. */
@Injectable({ deps: [DataLoaderService, AuditService] })
export class KnowledgeResources {
  constructor(
    private readonly dataLoader: DataLoaderService,
    private readonly auditService: AuditService,
  ) {}

  @Resource({
    uri: 'knowledge://sources',
    name: 'Authoritative Sources',
    description: 'Current authoritative enterprise sources and their facts',
    mimeType: 'application/json',
    annotations: { audience: ['assistant', 'user'] },
  })
  async getAuthoritativeSources(_uri: string, _ctx: ExecutionContext) {
    return this.dataLoader.getAuthoritativeSources();
  }

  @Resource({
    uri: 'knowledge://documents',
    name: 'Enterprise Documents',
    description: 'All enterprise documents with their claims and dependencies',
    mimeType: 'application/json',
    annotations: { audience: ['assistant', 'user'] },
  })
  async getDocuments(_uri: string, _ctx: ExecutionContext) {
    return this.dataLoader.getDocuments();
  }

  @Resource({
    uri: 'knowledge://pending-updates',
    name: 'Pending Updates',
    description: 'Knowledge update proposals awaiting approval',
    mimeType: 'application/json',
    annotations: { audience: ['assistant', 'user'] },
  })
  async getPendingUpdates(_uri: string, _ctx: ExecutionContext) {
    return this.dataLoader
      .getPendingUpdates()
      .filter((update) => update.status === 'AWAITING_APPROVAL');
  }

  @Resource({
    uri: 'knowledge://audit-log',
    name: 'Audit Log',
    description: 'History of all approved, rejected, and applied knowledge changes',
    mimeType: 'application/json',
    annotations: { audience: ['assistant', 'user'] },
  })
  async getAuditLog(_uri: string, _ctx: ExecutionContext) {
    return this.auditService.getLog({ limit: 100 });
  }
}
