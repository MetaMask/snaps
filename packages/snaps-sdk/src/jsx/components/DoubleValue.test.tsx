import { DoubleValue } from './DoubleValue';

describe('DoubleValue', () => {
  it('renders', () => {
    const result = <DoubleValue left="$200" right="0.05 ETH" />;

    expect(result).toStrictEqual({
      type: 'DoubleValue',
      key: null,
      props: {
        left: '$200',
        right: '0.05 ETH',
      },
    });
  });
});
