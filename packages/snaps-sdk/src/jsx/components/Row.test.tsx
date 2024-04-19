import { Address } from './Address';
import { Image } from './Image';
import { Row } from './Row';
import { Text } from './Text';

describe('Row', () => {
  it('renders a row with an address', () => {
    const result = (
      <Row label="Foo">
        <Address address="0x1234" />
      </Row>
    );

    expect(result).toStrictEqual({
      type: 'row',
      key: null,
      props: {
        label: 'Foo',
        children: {
          type: 'address',
          key: null,
          props: {
            address: '0x1234',
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
      type: 'row',
      key: null,
      props: {
        label: 'Foo',
        children: {
          type: 'text',
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
      type: 'row',
      key: null,
      props: {
        label: 'Foo',
        children: {
          type: 'image',
          key: null,
          props: {
            src: '<svg />',
            alt: 'Bar',
          },
        },
      },
    });
  });
});
