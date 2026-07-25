import assert from 'node:assert/strict';
import test from 'node:test';
import { DataLoaderService, KnowledgeInputError } from '../src/services/data-loader.service.js';
import { ChangeDetectionService } from '../src/services/change-detection.service.js';
import { DependencyService } from '../src/services/dependency.service.js';

test('detects the expected Phase 4 changes', () => {
  const loader = new DataLoaderService();
  const result = new ChangeDetectionService(loader).detectChanges();
  assert.equal(result.total_sources_checked, 6);
  assert.equal(result.sources_with_changes, 4);
  assert.equal(result.changes.length, 7);
  assert.deepEqual(result.changes.find((change) => change.fact_key === 'maximum_discount'), {
    source_id: 'discount-policy', source_title: 'Enterprise Discount Policy',
    fact_key: 'maximum_discount', old_value: '20%', new_value: '10%', changed: true,
  });
});

test('filters change detection to one known source', () => {
  const loader = new DataLoaderService();
  const result = new ChangeDetectionService(loader).detectChanges('discount-policy');
  assert.equal(result.total_sources_checked, 1);
  assert.equal(result.sources_with_changes, 1);
  assert.equal(result.changes.length, 3);
});

test('rejects unknown sources and facts', () => {
  const loader = new DataLoaderService();
  const changes = new ChangeDetectionService(loader);
  const dependencies = new DependencyService(loader);
  assert.throws(() => changes.detectChanges('does-not-exist'), (error: unknown) => error instanceof KnowledgeInputError);
  assert.throws(() => dependencies.findAffectedKnowledge('discount-policy', 'does-not-exist'), (error: unknown) => error instanceof KnowledgeInputError);
});

test('returns affected claims with dependency metadata', () => {
  const loader = new DataLoaderService();
  const result = new DependencyService(loader).findAffectedKnowledge('discount-policy', 'maximum_discount');
  assert.equal(result.total_affected_documents, 6);
  assert.equal(result.total_affected_claims, 6);
  assert.ok(result.affected.every((document) => document.affected_claims.every((claim) => claim.dependency_type === 'direct')));
});
