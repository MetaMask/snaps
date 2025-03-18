import { AssetSelector } from './AssetSelector';

describe('AssetSelector', () => {
  it('renders an asset selector', () => {
    const result = (
      <AssetSelector
        name="foo"
        addresses={[
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        ]}
      />
    );

    expect(result).toStrictEqual({
      type: 'AssetSelector',
      props: {
        name: 'foo',
        addresses: [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        ],
      },
      key: null,
    });
  });

  it('renders an asset selector with optional props', () => {
    const result = (
      <AssetSelector
        name="foo"
        addresses={[
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        ]}
        chainIds={['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp']}
        value="solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
        disabled={true}
      />
    );

    expect(result).toStrictEqual({
      type: 'AssetSelector',
      props: {
        name: 'foo',
        addresses: [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        ],
        chainIds: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
        value:
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        disabled: true,
      },
      key: null,
    });
  });
});
