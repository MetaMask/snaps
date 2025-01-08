import { Text } from './Text';
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

  it('renders with text elements', () => {
    const result = (
      <Value
        value={<Text color="error">0.05 ETH</Text>}
        extra={<Text color="error">$200</Text>}
      />
    );

    expect(result).toStrictEqual({
      type: 'Value',
      key: null,
      props: {
        extra: {
          type: 'Text',
          key: null,
          props: {
            children: '$200',
            color: 'error',
          },
        },
        value: {
          type: 'Text',
          key: null,
          props: {
            children: '0.05 ETH',
            color: 'error',
          },
        },
      },
    });
  });
});
