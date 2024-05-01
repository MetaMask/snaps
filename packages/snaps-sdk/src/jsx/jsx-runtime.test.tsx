import { Bold, Box, Text } from './components';

describe('jsx', () => {
  it('renders a JSX component', () => {
    const element = <Text>Hello</Text>;

    expect(element).toStrictEqual({
      type: 'Text',
      key: null,
      props: { children: 'Hello' },
    });
  });

  it('renders a JSX component with a key', () => {
    const element = <Text key="foo">Hello</Text>;

    expect(element).toStrictEqual({
      type: 'Text',
      key: 'foo',
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

  it('throws an error for JSX fragments', () => {
    expect(() => <></>).toThrow(
      'A JSX fragment was used in a Snap component, which is not supported by Snaps UI. Please use one of the supported Snap components.',
    );
  });
});

describe('jsxs', () => {
  it('renders a JSX component', () => {
    const element = <Text>Hello</Text>;

    expect(element).toStrictEqual({
      type: 'Text',
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
      type: 'Box',
      key: null,
      props: {
        children: {
          type: 'Text',
          key: null,
          props: {
            children: [
              'Hello, ',
              { type: 'Bold', key: null, props: { children: 'world' } },
            ],
          },
        },
      },
    });
  });

  it('renders a nested JSX component with a key', () => {
    const element = (
      <Box>
        <Text key="foo">
          Hello, <Bold key="bar">world</Bold>
        </Text>
      </Box>
    );

    expect(element).toStrictEqual({
      type: 'Box',
      key: null,
      props: {
        children: {
          type: 'Text',
          key: 'foo',
          props: {
            children: [
              'Hello, ',
              { type: 'Bold', key: 'bar', props: { children: 'world' } },
            ],
          },
        },
      },
    });
  });
});
