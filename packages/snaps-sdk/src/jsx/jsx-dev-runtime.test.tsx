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

  it('validates the element', () => {
    // @ts-expect-error - Invalid props.
    expect(() => <Text foo="bar" />).toThrow(
      'Expected a JSX element, but received {"type":"Text","props":{"foo":"bar"},"key":null}. Please refer to the documentation for the supported JSX elements and their props.',
    );
  });

  it('throws an error for JSX fragments', () => {
    expect(() => <></>).toThrow(
      'A JSX fragment was used in a Snap component, which is not supported by Snaps UI. Please use one of the supported Snap components.',
    );
  });
});
