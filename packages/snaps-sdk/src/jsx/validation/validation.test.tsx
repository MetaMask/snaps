import { Box, Image, Row, Text } from '../components';
import {
  assertJSXElement,
  isJSXElement,
  isJSXElementUnsafe,
} from './validation';

describe('isJSXElement', () => {
  it.each([
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('returns true for a JSX element', (value) => {
    expect(isJSXElement(value)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    {
      type: 'text',
      props: {
        children: 'foo',
      },
    },
    {
      type: 'box',
      props: {
        children: {
          type: 'text',
          props: {
            children: 'foo',
          },
        },
      },
    },
    {
      type: 'row',
      key: null,
    },
  ])('returns false for "%p"', (value) => {
    expect(isJSXElement(value)).toBe(false);
  });
});

describe('isJSXElementUnsafe', () => {
  it.each([
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('returns true for a JSX element', (value) => {
    expect(isJSXElementUnsafe(value)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    {
      type: 'text',
      props: {
        children: 'foo',
      },
    },
    {
      type: 'box',
      props: {
        children: {
          type: 'text',
          props: {
            children: 'foo',
          },
        },
      },
    },
    {
      type: 'row',
      key: null,
    },
  ])('returns false for "%p"', (value) => {
    expect(isJSXElement(value)).toBe(false);
  });

  it('does not validate the props of a JSX element', () => {
    expect(
      isJSXElementUnsafe(
        // @ts-expect-error - Invalid props.
        <Text foo="bar">
          <Text>Invalid</Text>
        </Text>,
      ),
    ).toBe(true);
  });
});

describe('assertJSXElement', () => {
  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    {
      type: 'text',
      props: {
        children: 'foo',
      },
    },
    {
      type: 'box',
      props: {
        children: {
          type: 'text',
          props: {
            children: 'foo',
          },
        },
      },
    },
    {
      type: 'row',
      key: null,
    },
  ])('throws an error for "%p"', (element) => {
    expect(() => {
      assertJSXElement(element);
    }).toThrow(
      /Expected a JSX element, but received .+\. Please refer to the documentation for the supported JSX elements and their props\./u,
    );
  });

  it.each([
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('does not throw an error for a JSX element', (value) => {
    expect(() => {
      assertJSXElement(value);
    }).not.toThrow();
  });
});
