import { Value } from './Value';

describe('Value', () => {
  it('renders', () => {
    const result = <Value value="0.05 ETH" extra="$200" />;

    expect(result).toStrictEqual({
      type: 'Value',
      key: null,
      props: {
        extra: '$200',
        value: '0.05 ETH',
      },
    });
  });
});
