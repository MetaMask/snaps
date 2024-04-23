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
    expect(() => <Text foo="bar" />).toThrow();
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

  it('renders a fragment', () => {
    const element = (
      <>
        <Text>Hello</Text>
        <Text>World</Text>
      </>
    );

    expect(element).toStrictEqual({
      type: 'Box',
      key: null,
      props: {
        children: [
          { type: 'Text', key: null, props: { children: 'Hello' } },
          { type: 'Text', key: null, props: { children: 'World' } },
        ],
      },
    });
  });
});
