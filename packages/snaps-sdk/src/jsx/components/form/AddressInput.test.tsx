import { AddressInput } from './AddressInput';

describe('AddressInput', () => {
  it('renders an address input', () => {
    const result = <AddressInput name="address" chainId="eip155:1" />;

    expect(result).toStrictEqual({
      type: 'AddressInput',
      props: {
        name: 'address',
        chainId: 'eip155:1',
      },
      key: null,
    });
  });
});
