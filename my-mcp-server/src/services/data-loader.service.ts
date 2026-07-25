import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import { Injectable } from '@nitrostack/core';

import type {
  AuthoritativeSource,
  Document,
  Dependency,
  ProposedUpdate,
  AuditEntry,
} from '../types/index.js';

// ---------------------------------------------------------------------------
// Path resolution
// ---------------------------------------------------------------------------
// Works for both ESM (`import.meta.url`) and the compiled output in /dist.
// The data directory lives at <project-root>/src/data relative to the source
// tree. When compiled, the dist/ mirror has no data directory, so we walk
// upward from the running file to find <project-root>/src/data.
// ---------------------------------------------------------------------------

function resolveDataDir(): string {
  // __filename equivalent for ESM
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFile);

  // Walk up until we find a directory that contains package.json (project root)
  let dir = currentDir;
  for (let i = 0; i < 6; i++) {
    try {
      readFileSync(join(dir, 'package.json'));
      return resolve(dir, 'src', 'data');
    } catch {
      dir = dirname(dir);
    }
  }

  // Fallback: assume we are in src/services or dist/services
  return resolve(currentDir, '..', 'data');
}

const DATA_DIR = resolveDataDir();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readJson<T>(filename: string): T {
  const filePath = join(DATA_DIR, filename);
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

function writeJson<T>(filename: string, data: T): void {
  const filePath = join(DATA_DIR, filename);
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ---------------------------------------------------------------------------
// DataLoaderService
// ---------------------------------------------------------------------------

@Injectable()
export class DataLoaderService {
  // ── Read operations ──────────────────────────────────────────────────────

  /** Current (v2) authoritative sources — the ground truth. */
  getAuthoritativeSources(): AuthoritativeSource[] {
    return readJson<AuthoritativeSource[]>('authoritative_sources.json');
  }

  /** Previous (v1) authoritative sources — used for change detection. */
  getPreviousSources(): AuthoritativeSource[] {
    return readJson<AuthoritativeSource[]>('authoritative_sources_v1.json');
  }

  /** All enterprise documents with their claims. */
  getDocuments(): Document[] {
    return readJson<Document[]>('documents.json');
  }

  /** Pre-computed dependency graph (fact → documents). */
  getDependencies(): Dependency[] {
    return readJson<Dependency[]>('dependencies.json');
  }

  /** Pending remediation proposals. */
  getPendingUpdates(): ProposedUpdate[] {
    return readJson<ProposedUpdate[]>('pending_updates.json');
  }

  /** Approved-change audit log. */
  getAuditLog(): AuditEntry[] {
    return readJson<AuditEntry[]>('audit_log.json');
  }

  // ── Convenience look-ups ─────────────────────────────────────────────────

  /** Find a single authoritative source by ID (current version). */
  getSourceById(sourceId: string): AuthoritativeSource | undefined {
    return this.getAuthoritativeSources().find((s) => s.id === sourceId);
  }

  /** Find a single authoritative source in the previous (v1) data. */
  getPreviousSourceById(sourceId: string): AuthoritativeSource | undefined {
    return this.getPreviousSources().find((s) => s.id === sourceId);
  }

  /** Find a single document by ID. */
  getDocumentById(documentId: string): Document | undefined {
    return this.getDocuments().find((d) => d.id === documentId);
  }

  // ── Write operations ─────────────────────────────────────────────────────

  /** Overwrite the pending-updates file. */
  savePendingUpdates(updates: ProposedUpdate[]): void {
    writeJson('pending_updates.json', updates);
  }

  /** Overwrite the audit-log file. */
  saveAuditLog(entries: AuditEntry[]): void {
    writeJson('audit_log.json', entries);
  }

  /**
   * Update a single claim's text inside documents.json.
   * Mutates only the matching claim; everything else is preserved.
   */
  updateDocument(docId: string, claimId: string, newText: string): void {
    const docs = this.getDocuments();
    const doc = docs.find((d) => d.id === docId);

    if (!doc) {
      throw new Error(`Document not found: ${docId}`);
    }

    const claim = doc.claims.find((c) => c.id === claimId);
    if (!claim) {
      throw new Error(`Claim not found: ${claimId} in document ${docId}`);
    }

    claim.text = newText;
    writeJson('documents.json', docs);
  }
}
