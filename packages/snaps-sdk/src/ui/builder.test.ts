import { createBuilder } from './builder';
import { CopyableStruct } from './components';
import { NodeType } from './nodes';

describe('createBuilder', () => {
  it('creates a builder function', () => {
    const builder = createBuilder(NodeType.Copyable, CopyableStruct, ['value']);
    expect(builder).toBeInstanceOf(Function);
    expect(builder('foo')).toStrictEqual({
      type: NodeType.Copyable,
      value: 'foo',
    });

    expect(builder({ value: 'foo' })).toStrictEqual({
      type: NodeType.Copyable,
      value: 'foo',
    });
  });
});
