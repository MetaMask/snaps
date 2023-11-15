import { NodeType } from '../nodes';
import { address } from './address';

describe('address', () => {
  const MOCK_ADDRESS = '0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520';
  it('creates an address component', () => {
    expect(address({ value: MOCK_ADDRESS })).toStrictEqual({
      type: NodeType.Address,
      value: MOCK_ADDRESS,
    });
  });

  it('creates a copyable component using the shorthand form', () => {
    expect(address(MOCK_ADDRESS)).toStrictEqual({
      type: NodeType.Address,
      value: MOCK_ADDRESS,
    });
  });

  it('validates the args', () => {
    expect(() => address({ value: 'foo' })).toThrow(
      'Invalid address component: At path: value -- Expected a string matching `/0x[a-fA-F0-9]{40}/` but received "foo"',
    );

    // @ts-expect-error - Invalid args.
    expect(() => address({ value: MOCK_ADDRESS, bar: 'baz' })).toThrow(
      'Invalid address component: At path: bar -- Expected a value of type `never`, but received: `"baz"`.',
    );

    // @ts-expect-error - Invalid args.
    expect(() => address({})).toThrow(
      'Invalid address component: At path: value -- Expected a string, but received: undefined.',
    );
  });
});
