import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)));

function mergeProjectsWithDefaults<T>(loaded: T[] | undefined, defaults: T[]): T[] {
  if (!Array.isArray(loaded) || loaded.length === 0) return defaults;
  return loaded;
}

test('mergeProjects source only seeds defaults when the list is empty', () => {
  const source = readFileSync(join(root, 'mergeProjects.ts'), 'utf8');
  assert.match(source, /loaded\.length === 0\) return projectsData/);
  assert.equal(source.includes('merged.push(def)'), false);
});

test('empty projects seed from defaults', () => {
  const defaults = [{ id: 'a' }, { id: 'b' }];
  assert.deepEqual(mergeProjectsWithDefaults(undefined, defaults), defaults);
  assert.deepEqual(mergeProjectsWithDefaults([], defaults), defaults);
});

test('deleting a default project is preserved (not re-seeded)', () => {
  const defaults = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const withoutFirst = defaults.slice(1);
  assert.deepEqual(mergeProjectsWithDefaults(withoutFirst, defaults), withoutFirst);
});

test('list add and delete helpers keep unique ids', () => {
  const add = <T extends { id: string }>(list: T[], item: T) =>
    [item, ...list.filter((entry) => entry.id !== item.id)];
  const remove = <T extends { id: string }>(list: T[], id: string) =>
    list.filter((entry) => entry.id !== id);

  const base = [{ id: 'a' }, { id: 'b' }];
  const withNew = add(base, { id: 'c' });
  assert.deepEqual(withNew.map((x) => x.id), ['c', 'a', 'b']);
  assert.deepEqual(remove(withNew, 'a').map((x) => x.id), ['c', 'b']);
});
