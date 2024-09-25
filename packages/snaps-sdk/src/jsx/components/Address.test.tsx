import { Address } from './Address';

describe('Address', () => {
  it('renders an address', () => {
    const result = (
      <Address address="0x1234567890123456789012345678901234567890" />
    );

    expect(result).toStrictEqual({
      type: 'Address',
      key: null,
      props: {
        address: '0x1234567890123456789012345678901234567890',
      },
    });
  });

  it('renders an address with a link', () => {
    const result = (
      <Address
        address="0x1234567890123456789012345678901234567890"
        href="https://foo.bar"
      />
    );

    expect(result).toStrictEqual({
      type: 'Address',
      key: null,
      props: {
        address: '0x1234567890123456789012345678901234567890',
        href: 'https://foo.bar',
      },
    });
  });
});
