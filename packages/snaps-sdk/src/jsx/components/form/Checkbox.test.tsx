import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders a checkbox', () => {
    const result = <Checkbox name="foo" checked={true} />;

    expect(result).toStrictEqual({
      type: 'Checkbox',
      props: {
        name: 'foo',
        checked: true,
      },
      key: null,
    });
  });

  it('renders a checkbox with a variant and a label', () => {
    const result = (
      <Checkbox name="foo" label="Foo" checked={true} variant="toggle" />
    );

    expect(result).toStrictEqual({
      type: 'Checkbox',
      props: {
        name: 'foo',
        checked: true,
        variant: 'toggle',
        label: 'Foo',
      },
      key: null,
    });
  });
});
