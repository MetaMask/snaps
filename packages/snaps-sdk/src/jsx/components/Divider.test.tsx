import { Divider } from './Divider';

describe('Divider', () => {
  it('renders a divider', () => {
    const result = <Divider />;

    expect(result).toStrictEqual({
      type: 'Divider',
      key: null,
      props: {},
    });
  });
});
