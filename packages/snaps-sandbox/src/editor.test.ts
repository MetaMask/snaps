import { describe, it, expect, beforeAll, vi } from 'vitest';

vi.mock('monaco-editor/esm/vs/editor/editor.worker?worker');
vi.mock('monaco-editor/esm/vs/language/json/json.worker?worker');

describe('MonacoEnvironment', () => {
  describe('getWorker', () => {
    beforeAll(async () => {
      await import('./editor');
    });

    it('returns a new instance of the editor worker', () => {
      const worker = self.MonacoEnvironment?.getWorker?.('foo', 'editor');
      expect(worker).toBeDefined();
    });

    it('returns a new instance of the JSON worker', () => {
      const worker = self.MonacoEnvironment?.getWorker?.('bar', 'json');
      expect(worker).toBeDefined();
    });
  });
});
