import { getBytes } from './bytes';
import { VirtualFile } from './virtual-file';

describe('getBytes', () => {
  const FOO_BAR_STR = 'foo bar';
  const FOO_BAR_UINT8 = new Uint8Array([
    0x66, 0x6f, 0x6f, 0x20, 0x62, 0x61, 0x72,
  ]);

  it('handles Uint8Array', () => {
    expect(getBytes(FOO_BAR_UINT8)).toStrictEqual(FOO_BAR_UINT8);
  });

  it('handles strings', () => {
    expect(getBytes(FOO_BAR_STR)).toStrictEqual(FOO_BAR_UINT8);
  });

  it('handles virtual files', () => {
    expect(getBytes(new VirtualFile(FOO_BAR_UINT8))).toStrictEqual(
      FOO_BAR_UINT8,
    );
    expect(getBytes(new VirtualFile(FOO_BAR_STR))).toStrictEqual(FOO_BAR_UINT8);
  });
});
