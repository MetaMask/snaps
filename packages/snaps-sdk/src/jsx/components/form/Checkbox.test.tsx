import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders a checkbox', () => {
    const result = <Checkbox name="foo" value={true} />;

    expect(result).toStrictEqual({
      type: 'Checkbox',
      props: {
        name: 'foo',
        value: true,
      },
      key: null,
    });
  });
});
