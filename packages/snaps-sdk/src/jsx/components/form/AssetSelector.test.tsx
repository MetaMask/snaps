import { AssetSelector } from './AssetSelector';

describe('AssetSelector', () => {
  it('renders an asset selector', () => {
    const result = (
      <AssetSelector
        addresses={['eip155:0:0x1234567890123456789012345678901234567890']}
      />
    );

    expect(result).toStrictEqual({
      type: 'AssetSelector',
      props: {
        addresses: ['eip155:0:0x1234567890123456789012345678901234567890'],
      },
      key: null,
    });
  });

  it('renders an asset selector with optional props', () => {
    const result = (
      <AssetSelector
        addresses={['eip155:0:0x1234567890123456789012345678901234567890']}
        chainIds={['eip155:1']}
        value="eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f"
        disabled={true}
      />
    );

    expect(result).toStrictEqual({
      type: 'AssetSelector',
      props: {
        addresses: ['eip155:0:0x1234567890123456789012345678901234567890'],
        chainIds: ['eip155:1'],
        value: 'eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f',
        disabled: true,
      },
      key: null,
    });
  });
});
