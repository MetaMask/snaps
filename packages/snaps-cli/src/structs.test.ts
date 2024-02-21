import { resolve } from 'path/posix';
import { create, is } from 'superstruct';

import { file } from './structs';

// Mock resolve so these tests work on Windows
jest.mock('path', () => ({ resolve }));

describe('file', () => {
  it('resolves a file path relative to the current working directory', () => {
    jest.spyOn(process, 'cwd').mockReturnValue('/foo/bar');

    expect(is('packages/snaps-utils/src/structs.test.ts', file())).toBe(true);
    expect(create('packages/snaps-utils/src/structs.test.ts', file())).toBe(
      '/foo/bar/packages/snaps-utils/src/structs.test.ts',
    );
    expect(create('/packages/snaps-utils/src/structs.test.ts', file())).toBe(
      '/packages/snaps-utils/src/structs.test.ts',
    );
  });
});
