import { is } from 'superstruct';

import {
  Address,
  Bold,
  Box,
  Button,
  Copyable,
  Divider,
  Field,
  Form,
  Heading,
  Image,
  Input,
  Italic,
  Link,
  Row,
  Spinner,
  Text,
} from './components';
import {
  AddressStruct,
  assertJSXElement,
  BoldStruct,
  BoxStruct,
  ButtonStruct,
  CopyableStruct,
  DividerStruct,
  ElementStruct,
  FieldStruct,
  FormStruct,
  HeadingStruct,
  ImageStruct,
  InputStruct,
  isJSXElement,
  isJSXElementUnsafe,
  ItalicStruct,
  KeyStruct,
  LinkStruct,
  RowStruct,
  SpinnerStruct,
  StringElementStruct,
  TextStruct,
} from './validation';

describe('KeyStruct', () => {
  it.each(['foo', 42])('validates a key', (value) => {
    expect(is(value, KeyStruct)).toBe(true);
  });

  it.each([null, undefined, {}, []])('does not validate "%p"', (value) => {
    expect(is(value, KeyStruct)).toBe(false);
  });
});

describe('StringElementStruct', () => {
  it('validates a string value', () => {
    expect(is('foo', StringElementStruct)).toBe(true);
  });

  it('validates an array of string elements', () => {
    expect(is(['foo', 'bar'], StringElementStruct)).toBe(true);
  });

  it.each([null, undefined, {}])('does not validate "%p"', (value) => {
    expect(is(value, StringElementStruct)).toBe(false);
  });
});

describe('ElementStruct', () => {
  it.each([
    {
      type: 'text',
      props: {
        children: 'foo',
      },
      key: null,
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
      key: null,
    },
    {
      type: 'row',
      props: {
        label: 'label',
      },
      key: null,
    },
  ])('validates an element', (value) => {
    expect(is(value, ElementStruct)).toBe(true);
  });

  it.each([
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
      props: {
        label: 'label',
      },
    },
  ])('does not validate "%p"', (value) => {
    expect(is(value, ElementStruct)).toBe(false);
  });
});

describe('ButtonStruct', () => {
  it.each([
    <Button>foo</Button>,
    <Button name="foo">bar</Button>,
    <Button type="submit">foo</Button>,
    <Button variant="destructive">foo</Button>,
    <Button disabled={true}>foo</Button>,
    <Button key="button">foo</Button>,
  ])('validates a button element', (value) => {
    expect(is(value, ButtonStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Button />,
    // @ts-expect-error - Invalid props.
    <Button variant="foo">bar</Button>,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="src" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, ButtonStruct)).toBe(false);
  });
});

describe('InputStruct', () => {
  it.each([
    <Input name="foo" type="text" />,
    <Input name="foo" type="password" />,
    <Input name="foo" type="number" />,
    <Input name="foo" type="text" value="bar" />,
    <Input name="foo" type="text" placeholder="bar" />,
  ])('validates an input element', (value) => {
    expect(is(value, InputStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Input />,
    // @ts-expect-error - Invalid props.
    <Input name="foo" type="foo" />,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="src" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, InputStruct)).toBe(false);
  });
});

describe('FieldStruct', () => {
  it.each([
    <Field label="foo">
      <Input name="foo" type="text" />
      <Button>foo</Button>
    </Field>,
    <Field label="foo">
      <Input name="foo" type="text" />
    </Field>,
  ])('validates a field element', (value) => {
    expect(is(value, FieldStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Field />,
    <Field label="foo" error="bar">
      <Text>foo</Text>
    </Field>,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="src" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, FieldStruct)).toBe(false);
  });
});

describe('FormStruct', () => {
  it.each([
    <Form name="foo">
      <Field label="foo">
        <Input name="foo" type="text" />
        <Button>foo</Button>
      </Field>
    </Form>,
    <Form name="foo">
      <Field label="foo">
        <Input name="foo" type="text" />
      </Field>
    </Form>,
    <Form name="foo">
      <Field label="foo">
        <Input name="foo" type="text" />
        <Button>foo</Button>
      </Field>
    </Form>,
    <Form name="foo">
      <Field label="foo">
        <Input name="foo" type="text" />
      </Field>
    </Form>,
  ])('validates a form element', (value) => {
    expect(is(value, FormStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Form />,
    <Form name="foo">
      <Text>foo</Text>
    </Form>,
    <Form name="foo">
      <Field label="foo">
        <Text>foo</Text>
      </Field>
    </Form>,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="src" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, FormStruct)).toBe(false);
  });
});

describe('BoldStruct', () => {
  it.each([<Bold>hello</Bold>])('validates a bold element', (value) => {
    expect(is(value, BoldStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Bold />,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="src" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, BoldStruct)).toBe(false);
  });
});

describe('ItalicStruct', () => {
  it.each([<Italic>hello</Italic>, <Italic key="italic">hello</Italic>])(
    'validates an italic element',
    (value) => {
      expect(is(value, ItalicStruct)).toBe(true);
    },
  );

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Italic />,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="src" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, ItalicStruct)).toBe(false);
  });
});

describe('AddressStruct', () => {
  it.each([
    <Address address="0x1234567890abcdef1234567890abcdef12345678" />,
    <Address address="0x1234567890abcdef1234567890abcdef12345678" />,
  ])('validates an address element', (value) => {
    expect(is(value, AddressStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Address />,
    // @ts-expect-error - Invalid props.
    <Address>
      <Text>foo</Text>
    </Address>,
    <Address address="0x1234" />,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="src" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, AddressStruct)).toBe(false);
  });
});

describe('BoxStruct', () => {
  it.each([
    <Box>
      <Text>foo</Text>
    </Box>,
    <Box>
      <Text>foo</Text>
      <Text>bar</Text>
    </Box>,
    <Box>
      <Text>foo</Text>
      <Row label="label">
        <Image src="src" alt="alt" />
      </Row>
    </Box>,
  ])('validates a box element', (value) => {
    expect(is(value, BoxStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Box />,
    <Text>foo</Text>,
    <Row label="label">
      <Image src="src" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, BoxStruct)).toBe(false);
  });
});

describe('CopyableStruct', () => {
  it.each([
    <Copyable value="foo" />,
    <Copyable value="bar" sensitive={true} />,
  ])('validates a copyable element', (value) => {
    expect(is(value, CopyableStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Copyable />,
    // @ts-expect-error - Invalid props.
    <Copyable>foo</Copyable>,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="src" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, CopyableStruct)).toBe(false);
  });
});

describe('DividerStruct', () => {
  it.each([<Divider />])('validates a divider element', (value) => {
    expect(is(value, DividerStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Divider>foo</Divider>,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="src" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, DividerStruct)).toBe(false);
  });
});

describe('HeadingStruct', () => {
  it.each([<Heading>Hello</Heading>])(
    'validates a heading element',
    (value) => {
      expect(is(value, HeadingStruct)).toBe(true);
    },
  );

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Heading />,
    <Heading>
      {/* @ts-expect-error - Invalid props. */}
      <Text>foo</Text>
    </Heading>,
    <Box>
      <Text>Hello</Text>
    </Box>,
    <Row label="label">
      <Image src="src" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, HeadingStruct)).toBe(false);
  });
});

describe('ImageStruct', () => {
  it.each([<Image src="<svg />" alt="alt" />, <Image src="<svg />" />])(
    'validates an image element',
    (value) => {
      expect(is(value, ImageStruct)).toBe(true);
    },
  );

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Image />,
    // @ts-expect-error - Invalid props.
    <Image src="src" alt={42} />,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="src" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, ImageStruct)).toBe(false);
  });
});

describe('LinkStruct', () => {
  it.each([<Link href="https://example.com">foo</Link>])(
    'validates a link element',
    (value) => {
      expect(is(value, LinkStruct)).toBe(true);
    },
  );

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Link />,
    // @ts-expect-error - Invalid props.
    <Link href={42}>foo</Link>,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="src" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, LinkStruct)).toBe(false);
  });
});

describe('TextStruct', () => {
  it.each([
    <Text>foo</Text>,
    <Text>
      Hello, <Bold>world</Bold>
    </Text>,
  ])('validates a text element', (value) => {
    expect(is(value, TextStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Text />,
    // @ts-expect-error - Invalid props.
    <Text foo="bar">foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="src" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, TextStruct)).toBe(false);
  });
});

describe('RowStruct', () => {
  it.each([
    <Row label="label">
      <Text>foo</Text>
    </Row>,
    <Row label="label">
      <Image src="src" alt="alt" />
    </Row>,
    <Row label="label" variant="default">
      <Address address="0x1234567890abcdef1234567890abcdef12345678" />
    </Row>,
  ])('validates a row element', (value) => {
    expect(is(value, RowStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Row />,
    <Row label="label">
      <Bold>foo</Bold>
    </Row>,
    // @ts-expect-error - Invalid props.
    <Row label="label" variant="foo">
      <Text>foo</Text>
    </Row>,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, RowStruct)).toBe(false);
  });
});

describe('SpinnerStruct', () => {
  it.each([<Spinner />])('validates a spinner element', (value) => {
    expect(is(value, SpinnerStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Spinner>foo</Spinner>,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="src" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, SpinnerStruct)).toBe(false);
  });
});

describe('isJSXElement', () => {
  it.each([
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="src" alt="alt" />
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
      <Image src="src" alt="alt" />
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
      <Image src="src" alt="alt" />
    </Row>,
  ])('does not throw an error for a JSX element', (value) => {
    expect(() => {
      assertJSXElement(value);
    }).not.toThrow();
  });
});
