import { Address } from './Address';
import { Image } from './Image';
import { Link } from './Link';
import { Row } from './Row';
import { Text } from './Text';

describe('Row', () => {
  it('renders a row with an address', () => {
    const result = (
      <Row label="Foo">
        <Address address="0x1234567890123456789012345678901234567890" />
      </Row>
    );

    expect(result).toStrictEqual({
      type: 'Row',
      key: null,
      props: {
        label: 'Foo',
        children: {
          type: 'Address',
          key: null,
          props: {
            address: '0x1234567890123456789012345678901234567890',
          },
        },
      },
    });
  });

  it('renders a row with text', () => {
    const result = (
      <Row label="Foo">
        <Text>Bar</Text>
      </Row>
    );

    expect(result).toStrictEqual({
      type: 'Row',
      key: null,
      props: {
        label: 'Foo',
        children: {
          type: 'Text',
          key: null,
          props: {
            children: 'Bar',
          },
        },
      },
    });
  });

  it('renders a row with an image', () => {
    const result = (
      <Row label="Foo">
        <Image src="<svg />" alt="Bar" />
      </Row>
    );

    expect(result).toStrictEqual({
      type: 'Row',
      key: null,
      props: {
        label: 'Foo',
        children: {
          type: 'Image',
          key: null,
          props: {
            src: '<svg />',
            alt: 'Bar',
          },
        },
      },
    });
  });

  it('renders a row with a Link', () => {
    const result = (
      <Row label="Foo">
        <Link href="https://example.com">
          <Address address="0x1234567890123456789012345678901234567890" />
        </Link>
      </Row>
    );

    expect(result).toStrictEqual({
      type: 'Row',
      key: null,
      props: {
        label: 'Foo',
        children: {
          type: 'Link',
          key: null,
          props: {
            href: 'https://example.com',
            children: {
              type: 'Address',
              key: null,
              props: {
                address: '0x1234567890123456789012345678901234567890',
              },
            },
          },
        },
      },
    });
  });
});
