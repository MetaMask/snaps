import { Radio } from './Radio';

describe('Radio', () => {
  it('renders a radio option', () => {
    const result = <Radio value="foo">Foo</Radio>;

    expect(result).toStrictEqual({
      type: 'Radio',
      props: {
        value: 'foo',
        children: 'Foo',
      },
      key: null,
    });
  });
});
