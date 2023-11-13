import { is } from 'superstruct';

import { NodeType } from '../nodes';
import { image, svg } from './image';

const MOCK_SVG = '<svg />';

describe('svg', () => {
  it('validates an SVG string', () => {
    expect(is(MOCK_SVG, svg())).toBe(true);
    expect(is('<svg></svg>', svg())).toBe(true);
    expect(is('<foo/>', svg())).toBe(false);
    expect(is(1, svg())).toBe(false);
  });
});

describe('image', () => {
  it('creates an image component', () => {
    expect(image({ value: MOCK_SVG })).toStrictEqual({
      type: NodeType.Image,
      value: MOCK_SVG,
    });
  });

  it('creates an image component using the shorthand form', () => {
    expect(image(MOCK_SVG)).toStrictEqual({
      type: NodeType.Image,
      value: MOCK_SVG,
    });
  });

  it('validates the args', () => {
    expect(() => image({ value: 'foo' })).toThrow(
      'Invalid image component: At path: value -- Value is not a valid SVG.',
    );

    // @ts-expect-error - Invalid args.
    expect(() => image({ value: MOCK_SVG, bar: 'baz' })).toThrow(
      'Invalid image component: At path: bar -- Expected a value of type `never`, but received: `"baz"`.',
    );

    // @ts-expect-error - Invalid args.
    expect(() => image({})).toThrow(
      'Invalid image component: At path: value -- Expected a string, but received: undefined.',
    );
  });
});
