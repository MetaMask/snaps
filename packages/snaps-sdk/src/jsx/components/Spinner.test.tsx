import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders a spinner', () => {
    const result = <Spinner />;

    expect(result).toStrictEqual({
      type: 'spinner',
      key: null,
      props: {},
    });
  });
});
