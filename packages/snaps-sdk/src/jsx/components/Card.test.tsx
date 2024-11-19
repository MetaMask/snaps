import { Address } from './Address';
import { Card } from './Card';

describe('Card', () => {
  it('renders a card', () => {
    const result = (
      <Card
        image="<svg />"
        title="Title"
        description="Description"
        value="$1200"
        extra="0.12 ETH"
      />
    );

    expect(result).toStrictEqual({
      type: 'Card',
      key: null,
      props: {
        image: '<svg />',
        title: 'Title',
        description: 'Description',
        value: '$1200',
        extra: '0.12 ETH',
      },
    });
  });

  it('renders a card with an address as title', () => {
    const result = (
      <Card
        image="<svg />"
        title={
          <Address
            address="0x1234567890123456789012345678901234567890"
            displayName
            avatar={false}
          />
        }
        description="Description"
        value="$1200"
        extra="0.12 ETH"
      />
    );

    expect(result).toStrictEqual({
      type: 'Card',
      key: null,
      props: {
        image: '<svg />',
        title: {
          key: null,
          props: {
            address: '0x1234567890123456789012345678901234567890',
            avatar: false,
            displayName: true,
          },
          type: 'Address',
        },
        description: 'Description',
        value: '$1200',
        extra: '0.12 ETH',
      },
    });
  });
});
