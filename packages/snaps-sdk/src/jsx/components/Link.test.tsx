import { Address } from './Address';
import { Icon } from './Icon';
import { Link } from './Link';

describe('Link', () => {
  it('renders a link', () => {
    const result = <Link href="https://example.com">Foo</Link>;

    expect(result).toStrictEqual({
      type: 'Link',
      key: null,
      props: {
        href: 'https://example.com',
        children: 'Foo',
      },
    });
  });

  it('renders a link with nested text', () => {
    const result = <Link href="https://example.com">Hello {'world'}!</Link>;

    expect(result).toStrictEqual({
      type: 'Link',
      key: null,
      props: {
        href: 'https://example.com',
        children: ['Hello ', 'world', '!'],
      },
    });
  });

  it('renders a link with an icon', () => {
    const result = (
      <Link href="metamask://client/">
        <Icon name="arrow-left" size="md" />
      </Link>
    );

    expect(result).toStrictEqual({
      type: 'Link',
      key: null,
      props: {
        href: 'metamask://client/',
        children: {
          type: 'Icon',
          key: null,
          props: { name: 'arrow-left', size: 'md' },
        },
      },
    });
  });

  it('renders a link with an Address', () => {
    const result = (
      <Link href="https://example.com">
        <Address address="0x1234567890123456789012345678901234567890" />
      </Link>
    );

    expect(result).toStrictEqual({
      type: 'Link',
      key: null,
      props: {
        href: 'https://example.com',
        children: {
          type: 'Address',
          key: null,
          props: { address: '0x1234567890123456789012345678901234567890' },
        },
      },
    });
  });

  it('renders a link with a conditional value', () => {
    const result = (
      <Link href="https://example.com">
        Hello
        {/* eslint-disable-next-line no-constant-binary-expression */}
        {false && 'world'}
      </Link>
    );

    expect(result).toStrictEqual({
      type: 'Link',
      key: null,
      props: {
        href: 'https://example.com',
        children: ['Hello', false],
      },
    });
  });
});
