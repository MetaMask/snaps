import { Copyable } from './Copyable';

describe('Copyable', () => {
  it('renders a copyable', () => {
    const result = (
      <Copyable value="0x1234567890123456789012345678901234567890" />
    );

    expect(result).toStrictEqual({
      type: 'Copyable',
      key: null,
      props: {
        value: '0x1234567890123456789012345678901234567890',
      },
    });
  });

  it('renders a sensitive copyable', () => {
    const result = (
      <Copyable value="0x1234567890123456789012345678901234567890" sensitive />
    );

    expect(result).toStrictEqual({
      type: 'Copyable',
      key: null,
      props: {
        value: '0x1234567890123456789012345678901234567890',
        sensitive: true,
      },
    });
  });
});
