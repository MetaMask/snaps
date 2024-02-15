import { stringToBytes } from '@metamask/utils';

import {
  SVG_MAX_BYTE_SIZE,
  SVG_MAX_BYTE_SIZE_TEXT,
  assertIsSnapIcon,
  getSvgDimensions,
  parseSvg,
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

describe('parseSvg', () => {
  it('parses valid SVGs', () => {
    expect(parseSvg(ALTERNATIVE_SNAP_ICON)).toMatchInlineSnapshot(`
      {
        "@_fill": "none",
        "@_height": 25,
        "@_width": 24,
        "@_xmlns": "http://www.w3.org/2000/svg",
        "path": {
          "@_d": "M17.037 0H6.975C2.605 0 0 2.617 0 6.987v10.05c0 4.37 2.605 6.975 6.975 6.975h10.05c4.37 0 6.975-2.605 6.975-6.976V6.988C24.012 2.617 21.407 0 17.037 0ZM11.49 17.757c0 .36-.18.684-.492.876a.975.975 0 0 1-.54.156 1.11 1.11 0 0 1-.469-.108l-4.202-2.1a1.811 1.811 0 0 1-.985-1.61v-3.973c0-.36.18-.685.493-.877a1.04 1.04 0 0 1 1.008-.048l4.202 2.101a1.8 1.8 0 0 1 .997 1.609v3.974h-.012Zm-.252-6.423L6.723 8.896a1.045 1.045 0 0 1-.528-.924c0-.384.204-.744.528-.924l4.515-2.438a1.631 1.631 0 0 1 1.524 0l4.515 2.438c.324.18.528.528.528.924s-.204.744-.528.924l-4.515 2.438c-.24.132-.504.192-.768.192a1.54 1.54 0 0 1-.756-.192Zm7.972 3.638c0 .684-.385 1.308-.997 1.608l-4.202 2.101c-.144.072-.3.108-.468.108a.975.975 0 0 1-.54-.156 1.017 1.017 0 0 1-.493-.876v-3.974c0-.684.384-1.309.997-1.609l4.202-2.101a1.04 1.04 0 0 1 1.008.048c.313.192.493.516.493.877v3.974Z",
          "@_fill": "#24272A",
        },
      }
    `);
  });

  it('throws for invalid SVGs', () => {
    expect(() => parseSvg('')).toThrow('Snap icon must be a valid SVG.');
    expect(() => parseSvg('foo')).toThrow('Snap icon must be a valid SVG.');
  });
});

describe('getSvgDimensions', () => {
  it('uses height and width when available', () => {
    expect(getSvgDimensions(ALTERNATIVE_SNAP_ICON)).toStrictEqual({
      height: 25,
      width: 24,
    });
  });

  it('uses viewBox as a fallback', () => {
    expect(
      getSvgDimensions(
        '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"></svg>',
      ),
    ).toStrictEqual({
      height: 24,
      width: 24,
    });
  });

  it('returns null if no dimensions are found', () => {
    expect(
      getSvgDimensions(
        '<svg fill="none" xmlns="http://www.w3.org/2000/svg"></svg>',
      ),
    ).toBeNull();
  });
});
