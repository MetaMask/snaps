// eslint-disable-next-line @typescript-eslint/no-shadow
import { Bold, Box, Text } from '../components';

describe('jsx', () => {
  it('renders a JSX component', () => {
    const element = <Text>Hello</Text>;

    expect(element).toStrictEqual({
      type: 'text',
      key: null,
      props: { children: 'Hello' },
    });
  });

  it('does not validate the element', () => {
    // @ts-expect-error - Invalid props.
    expect(() => <Text foo="bar" />).not.toThrow();
  });

  it('throws an error for built-in HTML elements', () => {
    expect(() => <div />).toThrow(
      'An HTML element ("div") was used in a Snap component, which is not supported by Snaps UI. Please use one of the supported Snap components.',
    );
  });
});

describe('jsxs', () => {
  it('renders a JSX component', () => {
    const element = <Text>Hello</Text>;

    expect(element).toStrictEqual({
      type: 'text',
      key: null,
      props: { children: 'Hello' },
    });
  });

  it('renders a nested JSX component', () => {
    const element = (
      <Box>
        <Text>
          Hello, <Bold>world</Bold>
        </Text>
      </Box>
    );

    expect(element).toStrictEqual({
      type: 'box',
      key: null,
      props: {
        children: {
          type: 'text',
          key: null,
          props: {
            children: [
              'Hello, ',
              { type: 'bold', key: null, props: { children: 'world' } },
            ],
          },
        },
      },
    });
  });

  it('renders a fragment', () => {
    const element = (
      <>
        <Text>Hello</Text>
        <Text>World</Text>
      </>
    );

    expect(element).toStrictEqual({
      type: 'box',
      key: null,
      props: {
        children: [
          { type: 'text', key: null, props: { children: 'Hello' } },
          { type: 'text', key: null, props: { children: 'World' } },
        ],
      },
    });
  });
});
