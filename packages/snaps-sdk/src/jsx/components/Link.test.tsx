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

  it('renders a link with a conditional value', () => {
    const result = (
      <Link href="https://example.com">
        Hello
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
