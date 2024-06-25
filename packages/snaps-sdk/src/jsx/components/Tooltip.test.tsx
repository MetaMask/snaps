import { Link } from './Link';
import { Text } from './Text';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('renders a tooltip', () => {
    const result = (
      <Tooltip content={<Text>Hello</Text>}>
        <Text>World</Text>
      </Tooltip>
    );

    expect(result).toStrictEqual({
      type: 'Tooltip',
      props: {
        children: {
          type: 'Text',
          props: {
            children: 'World',
          },
          key: null,
        },
        content: {
          type: 'Text',
          props: {
            children: 'Hello',
          },
          key: null,
        },
      },
      key: null,
    });
  });

  it('renders a tooltip with a string content', () => {
    const result = (
      <Tooltip content="Hello">
        <Text>World</Text>
      </Tooltip>
    );

    expect(result).toStrictEqual({
      type: 'Tooltip',
      props: {
        children: {
          type: 'Text',
          props: {
            children: 'World',
          },
          key: null,
        },
        content: 'Hello',
      },
      key: null,
    });
  });

  it('renders a tooltip with a link content', () => {
    const result = (
      <Tooltip content={<Link href="https://example.com">Link</Link>}>
        <Text>World</Text>
      </Tooltip>
    );

    expect(result).toStrictEqual({
      type: 'Tooltip',
      props: {
        children: {
          type: 'Text',
          props: {
            children: 'World',
          },
          key: null,
        },
        content: {
          type: 'Link',
          props: {
            children: 'Link',
            href: 'https://example.com',
          },
          key: null,
        },
      },
      key: null,
    });
  });

  it('renders a tooltip with a conditional value', () => {
    const result = (
      <Tooltip content="Hello">{false && <Text>World</Text>}</Tooltip>
    );

    expect(result).toStrictEqual({
      type: 'Tooltip',
      props: {
        children: false,
        content: 'Hello',
      },
      key: null,
    });
  });
});
