import { stringToBytes } from '@metamask/utils';

import {
  SVG_MAX_BYTE_SIZE,
  SVG_MAX_BYTE_SIZE_TEXT,
  assertIsSnapIcon,
} from './icon';
import { ALTERNATIVE_SNAP_ICON } from './test-utils';
import { VirtualFile } from './virtual-file';

describe('assertIsSnapIcon', () => {
  it('asserts that the file path ends with .svg', () => {
    const icon = new VirtualFile({
      value: stringToBytes('foo'),
      path: 'foo.png',
    });
    expect(() => assertIsSnapIcon(icon)).toThrow(
      'Expected snap icon to end in ".svg".',
    );
  });

  it('asserts that the file is an appropriate size', () => {
    const icon = new VirtualFile({
      value: new Uint8Array(SVG_MAX_BYTE_SIZE + 1).fill(1),
      path: 'foo.svg',
    });
    expect(() => assertIsSnapIcon(icon)).toThrow(
      `The specified SVG icon exceeds the maximum size of ${SVG_MAX_BYTE_SIZE_TEXT}.`,
    );
  });

  it('asserts that the file is a valid SVG', () => {
    const icon = new VirtualFile({
      value: stringToBytes('foo'),
      path: 'foo.svg',
    });
    expect(() => assertIsSnapIcon(icon)).toThrow(
      'Snap icon must be a valid SVG.',
    );
  });

  it('doesnt throw for a valid SVG', () => {
    const icon = new VirtualFile({
      value: stringToBytes(ALTERNATIVE_SNAP_ICON),
      path: 'foo.svg',
    });
    expect(() => assertIsSnapIcon(icon)).not.toThrow();
  });
});
