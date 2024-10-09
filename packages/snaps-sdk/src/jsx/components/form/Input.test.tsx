import { Input } from './Input';

describe('Input', () => {
  it('renders a text input', () => {
    const result = <Input name="foo" type="text" />;

    expect(result).toStrictEqual({
      type: 'Input',
      props: {
        name: 'foo',
        type: 'text',
      },
      key: null,
    });
  });

  it('renders a password input', () => {
    const result = <Input name="foo" type="password" />;

    expect(result).toStrictEqual({
      type: 'Input',
      props: {
        name: 'foo',
        type: 'password',
      },
      key: null,
    });
  });

  it('renders a number input', () => {
    const result = <Input name="foo" type="number" min={0} max={10} step={1} />;

    expect(result).toStrictEqual({
      type: 'Input',
      props: {
        name: 'foo',
        type: 'number',
        min: 0,
        max: 10,
        step: 1,
      },
      key: null,
    });
  });
});
