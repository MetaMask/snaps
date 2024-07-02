import { Cell } from './Cell';

describe('Cell', () => {
  it('renders a Cell', () => {
    const result = (
      <Cell
        image="<svg />"
        title="Title"
        description="Description"
        value="$1200"
        extra="0.12 ETH"
      />
    );

    expect(result).toStrictEqual({
      type: 'Cell',
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
