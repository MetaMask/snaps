import { NodeType } from '../nodes';
import { divider } from './divider';

describe('divider', () => {
  it('creates a divider component', () => {
    expect(divider()).toStrictEqual({
      type: NodeType.Divider,
    });
  });

  it('validates the args', () => {
    // @ts-expect-error - Invalid args.
    expect(() => divider({ bar: 'baz' })).toThrow(
      'Invalid divider component: At path: bar -- Expected a value of type `never`, but received: `"baz"`.',
    );
  });
});
