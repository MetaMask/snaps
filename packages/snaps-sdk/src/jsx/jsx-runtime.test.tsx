// eslint-disable-next-line @typescript-eslint/no-shadow
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

  it('validates the element', () => {
    // @ts-expect-error - Invalid props.
    expect(() => <Text foo="bar" />).toThrow(
      'Invalid JSX element: Expected the value to satisfy a union of `object | object | object | object | object | object | object | object | object | object | object | object | object | object | object | object`, but received: [object Object].',
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
});
