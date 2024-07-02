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
});
