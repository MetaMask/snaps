import {
  panel,
  text,
  row,
  address,
  image,
  form,
  button,
  copyable,
  divider,
  input,
  heading,
  spinner,
} from '@metamask/snaps-sdk';
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
} from '@metamask/snaps-sdk/jsx';

import {
  getTotalTextLength,
  hasChildren,
  getJsxElementFromComponent,
  getTextChildren,
  validateJsxLinks,
  validateTextLinks,
} from './ui';

describe('getTextChildren', () => {
  it('returns the JSX children for a markdown string with bold text', () => {
    expect(getTextChildren('Hello, **world**!')).toStrictEqual([
      'Hello, ',
      <Bold>world</Bold>,
      '!',
    ]);
  });

  it('returns the JSX children for a markdown string with italic text', () => {
    expect(getTextChildren('Hello, *world*!')).toStrictEqual([
      'Hello, ',
      <Italic>world</Italic>,
      '!',
    ]);
  });

  it('returns the JSX children for a markdown string with a link', () => {
    expect(getTextChildren('Hello, [world](https://foo.bar)!')).toStrictEqual([
      'Hello, ',
      <Link href="https://foo.bar">world</Link>,
      '!',
    ]);
  });

  it('returns the JSX children for a markdown string with a mailto link', () => {
    expect(
      getTextChildren('Hello, [world](mailto:foo@example.com)!'),
    ).toStrictEqual([
      'Hello, ',
      <Link href="mailto:foo@example.com">world</Link>,
      '!',
    ]);
  });

  it('returns the JSX children for a markdown string with a link without text', () => {
    expect(getTextChildren('Hello, <https://world.com>!')).toStrictEqual([
      'Hello, ',
      <Link href="https://world.com">https://world.com</Link>,
      '!',
    ]);

    expect(getTextChildren('Hello, [](https://world.com)!')).toStrictEqual([
      'Hello, ',
      <Link href="https://world.com">https://world.com</Link>,
      '!',
    ]);
  });

  it('returns the JSX children for a link with nested brackets', () => {
    expect(getTextChildren('Hello, [[world]](https://foo.bar)!')).toStrictEqual(
      ['Hello, ', <Link href="https://foo.bar">[world]</Link>, '!'],
    );
  });

  it('returns the JSX children for a link with a title', () => {
    expect(
      getTextChildren('Hello, [world](https://foo.bar "foo bar baz")!'),
    ).toStrictEqual([
      'Hello, ',
      <Link href="https://foo.bar">world</Link>,
      '!',
    ]);
  });

  it('returns the JSX children for a link with references', () => {
    expect(
      getTextChildren(
        `[foo][1]

[1]: https://foo.bar`,
      ),
    ).toStrictEqual([<Link href="https://foo.bar">foo</Link>]);
  });

  it('returns the JSX children for a link with references and a title', () => {
    expect(
      getTextChildren(
        `[foo][1]

[1]: https://foo.bar "foo bar baz"`,
      ),
    ).toStrictEqual([<Link href="https://foo.bar">foo</Link>]);
  });

  it('returns the JSX children for a markdown string with a link and bold text', () => {
    expect(
      getTextChildren('Hello, [**world**](https://foo.bar)!'),
    ).toStrictEqual([
      'Hello, ',
      <Link href="https://foo.bar">
        <Bold>world</Bold>
      </Link>,
      '!',
    ]);
  });

  it('returns the JSX children for a markdown string with a link and italic text', () => {
    expect(getTextChildren('Hello, [*world*](https://foo.bar)!')).toStrictEqual(
      [
        'Hello, ',
        <Link href="https://foo.bar">
          <Italic>world</Italic>
        </Link>,
        '!',
      ],
    );
  });

  it('returns the JSX children for a markdown string with a link and bold italic text', () => {
    expect(
      getTextChildren('Hello, [_**world**_](https://foo.bar)!'),
    ).toStrictEqual([
      'Hello, ',
      <Link href="https://foo.bar">
        <Italic>
          <Bold>world</Bold>
        </Italic>
      </Link>,
      '!',
    ]);
  });

  it('returns the JSX children for a markdown string with a link and italic bold text', () => {
    expect(
      getTextChildren('Hello, [**_world_**](https://foo.bar)!'),
    ).toStrictEqual([
      'Hello, ',
      <Link href="https://foo.bar">
        <Bold>
          <Italic>world</Italic>
        </Bold>
      </Link>,
      '!',
    ]);
  });

  it('returns the JSX children for a markdown string with multiple paragraphs', () => {
    expect(
      getTextChildren(
        'Hello world!\n\nThis is a second paragraph.\n\nThis is a third paragraph.',
      ),
    ).toStrictEqual([
      'Hello world!',
      '\n\n',
      'This is a second paragraph.',
      '\n\n',
      'This is a third paragraph.',
    ]);
  });

  it('returns the JSX children for a complex markdown string', () => {
    expect(
      getTextChildren(
        'Hello, [**world**](https://foo.bar)!\n\nThis is a second paragraph with _formatting_ **elements**.\n\nThis is a third paragraph.',
      ),
    ).toStrictEqual([
      'Hello, ',
      <Link href="https://foo.bar">
        <Bold>world</Bold>
      </Link>,
      '!',
      '\n\n',
      'This is a second paragraph with ',
      <Italic>formatting</Italic>,
      ' ',
      <Bold>elements</Bold>,
      '.',
      '\n\n',
      'This is a third paragraph.',
    ]);
  });

  it('strips unsupported markdown elements', () => {
    expect(
      getTextChildren('## Heading\n\nParagraph with `code`.\n\n---'),
    ).toStrictEqual(['Paragraph with ', '.']);
  });
});

describe('getJsxElementFromComponent', () => {
  it('returns the JSX element for an address component', () => {
    expect(
      getJsxElementFromComponent(
        address('0x4bbeeb066ed09b7aed07bf39eee0460dfa261520'),
      ),
    ).toStrictEqual(
      <Address address="0x4bbeeb066ed09b7aed07bf39eee0460dfa261520" />,
    );
  });

  it('returns the JSX element for a button component', () => {
    expect(
      getJsxElementFromComponent(
        button({
          variant: 'primary',
          name: 'foo',
          value: 'foo',
        }),
      ),
    ).toStrictEqual(
      <Button name="foo" variant="primary" type="button">
        foo
      </Button>,
    );
  });

  it('returns the JSX element for a button component with a secondary variant', () => {
    expect(
      getJsxElementFromComponent(
        button({
          variant: 'secondary',
          name: 'bar',
          value: 'bar',
        }),
      ),
    ).toStrictEqual(
      <Button name="bar" variant="destructive" type="button">
        bar
      </Button>,
    );
  });

  it('returns the JSX element for a copyable component', () => {
    expect(getJsxElementFromComponent(copyable('foo', true))).toStrictEqual(
      <Copyable value="foo" sensitive />,
    );
  });

  it('returns the JSX element for a divider component', () => {
    expect(getJsxElementFromComponent(divider())).toStrictEqual(<Divider />);
  });

  it('returns the JSX element for a form component', () => {
    expect(
      getJsxElementFromComponent(
        form({
          name: 'foo',
          children: [input({ label: 'bar', name: 'baz' }), button('button')],
        }),
      ),
    ).toStrictEqual(
      <Form name="foo">
        <Field label="bar">
          <Input
            name="baz"
            value={undefined}
            placeholder={undefined}
            type={undefined}
          />
        </Field>
        <Button name={undefined} type="button" variant={undefined}>
          button
        </Button>
      </Form>,
    );
  });

  it('returns the JSX element for a heading component', () => {
    expect(getJsxElementFromComponent(heading('foo'))).toStrictEqual(
      <Heading>foo</Heading>,
    );
  });

  it('returns the JSX element for an image component', () => {
    expect(getJsxElementFromComponent(image('<svg />'))).toStrictEqual(
      <Image src="<svg />" />,
    );
  });

  it('returns the JSX element for an input component', () => {
    expect(getJsxElementFromComponent(input('foo'))).toStrictEqual(
      <Field label={undefined}>
        <Input
          name="foo"
          value={undefined}
          placeholder={undefined}
          type={undefined}
        />
      </Field>,
    );
  });

  it('returns the JSX element for a panel component', () => {
    expect(
      getJsxElementFromComponent(panel([text('foo'), text('bar')])),
    ).toStrictEqual(
      <Box>
        <Text>foo</Text>
        <Text>bar</Text>
      </Box>,
    );
  });

  it('returns the JSX element for a row component', () => {
    expect(getJsxElementFromComponent(row('foo', text('bar')))).toStrictEqual(
      <Row label="foo">
        <Text>bar</Text>
      </Row>,
    );
  });

  it('returns the JSX element for a row component with an address component', () => {
    expect(
      getJsxElementFromComponent(
        row('foo', address('0x4bbeeb066ed09b7aed07bf39eee0460dfa261520')),
      ),
    ).toStrictEqual(
      <Row label="foo">
        <Address address="0x4bbeeb066ed09b7aed07bf39eee0460dfa261520" />
      </Row>,
    );
  });

  it('returns the JSX element for a spinner component', () => {
    expect(getJsxElementFromComponent(spinner())).toStrictEqual(<Spinner />);
  });

  it('returns the JSX element for a text component', () => {
    expect(getJsxElementFromComponent(text('foo'))).toStrictEqual(
      <Text>foo</Text>,
    );
  });

  it('returns the JSX element for a text component with bold text', () => {
    expect(getJsxElementFromComponent(text('Hello, **world**!'))).toStrictEqual(
      <Text>
        Hello, <Bold>world</Bold>!
      </Text>,
    );
  });

  it('returns the JSX element for a text component with italic text', () => {
    expect(getJsxElementFromComponent(text('Hello, *world*!'))).toStrictEqual(
      <Text>
        Hello, <Italic>world</Italic>!
      </Text>,
    );
  });

  it('returns the JSX element for a text component with a link', () => {
    expect(
      getJsxElementFromComponent(text('Hello, [world](https://foo.bar)!')),
    ).toStrictEqual(
      <Text>
        Hello, <Link href="https://foo.bar">world</Link>!
      </Text>,
    );
  });

  it('returns the JSX element for a deeply nested component tree', () => {
    expect(
      getJsxElementFromComponent(
        panel([
          text('foo'),
          panel([
            text('bar'),
            panel([
              text('baz'),
              panel([
                text('qux'),
                panel([text('quux'), panel([text('corge')])]),
              ]),
            ]),
          ]),
        ]),
      ),
    ).toStrictEqual(
      <Box>
        <Text>foo</Text>
        <Box>
          <Text>bar</Text>
          <Box>
            <Text>baz</Text>
            <Box>
              <Text>qux</Text>
              <Box>
                <Text>quux</Text>
                <Box>
                  <Text>corge</Text>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>,
    );
  });

  it('returns the JSX element for a complex component tree', () => {
    expect(
      getJsxElementFromComponent(
        panel([
          text('foo'),
          row('bar', text('baz')),
          panel([
            text('qux'),
            row('quux', image('<svg />')),
            panel([
              text(
                'Here are some _formatting_ **elements**.\n\nAnd a [link](https://foo.bar).',
              ),
              form({
                name: 'foo',
                children: [
                  input({ label: 'bar', name: 'baz' }),
                  button('button'),
                ],
              }),
            ]),
          ]),
        ]),
      ),
    ).toStrictEqual(
      <Box>
        <Text>foo</Text>
        <Row label="bar">
          <Text>baz</Text>
        </Row>
        <Box>
          <Text>qux</Text>
          <Row label="quux">
            <Image src="<svg />" />
          </Row>
          <Box>
            <Text>
              Here are some <Italic>formatting</Italic> <Bold>elements</Bold>.
              {'\n\n'}
              And a <Link href="https://foo.bar">link</Link>.
            </Text>
            <Form name="foo">
              <Field label="bar">
                <Input
                  name="baz"
                  value={undefined}
                  placeholder={undefined}
                  type={undefined}
                />
              </Field>
              <Button name={undefined} type="button" variant={undefined}>
                button
              </Button>
            </Form>
          </Box>
        </Box>
      </Box>,
    );
  });
});

describe('validateTextLinks', () => {
  it('passes for valid links', () => {
    expect(() =>
      validateTextLinks('[test](https://foo.bar)', () => false),
    ).not.toThrow();

    expect(() =>
      validateTextLinks('[test](mailto:foo@bar.baz)', () => false),
    ).not.toThrow();

    expect(() =>
      validateTextLinks('[](https://foo.bar)', () => false),
    ).not.toThrow();

    expect(() =>
      validateTextLinks('[[test]](https://foo.bar)', () => false),
    ).not.toThrow();

    expect(() =>
      validateTextLinks('[test](https://foo.bar "foo bar baz")', () => false),
    ).not.toThrow();

    expect(() =>
      validateTextLinks('<https://foo.bar>', () => false),
    ).not.toThrow();

    expect(() =>
      validateTextLinks(
        `[foo][1]
         [1]: https://foo.bar`,
        () => false,
      ),
    ).not.toThrow();

    expect(() =>
      validateTextLinks(
        `[foo][1]
         [1]: https://foo.bar "foo bar baz"`,
        () => false,
      ),
    ).not.toThrow();
  });

  it('passes for non-links', () => {
    expect(() =>
      validateTextLinks('Hello **http://localhost:3000**', () => false),
    ).not.toThrow();
  });

  it('throws an error if an invalid link is found in text', () => {
    expect(() =>
      validateTextLinks('[test](http://foo.bar)', () => false),
    ).toThrow('Invalid URL: Protocol must be one of: https:, mailto:.');

    expect(() =>
      validateTextLinks('[[test]](http://foo.bar)', () => false),
    ).toThrow('Invalid URL: Protocol must be one of: https:, mailto:.');

    expect(() => validateTextLinks('<http://foo.bar>', () => false)).toThrow(
      'Invalid URL: Protocol must be one of: https:, mailto:.',
    );

    expect(() =>
      validateTextLinks('[test](http://foo.bar "foo bar baz")', () => false),
    ).toThrow('Invalid URL: Protocol must be one of: https:, mailto:.');

    expect(() =>
      validateTextLinks('[foo][1]\n\n[1]: http://foo.bar', () => false),
    ).toThrow('Invalid URL: Protocol must be one of: https:, mailto:.');

    expect(() =>
      validateTextLinks(
        `[foo][1]\n\n[1]: http://foo.bar "foo bar baz"`,
        () => false,
      ),
    ).toThrow('Invalid URL: Protocol must be one of: https:, mailto:.');

    expect(() => validateTextLinks('[test](#code)', () => false)).toThrow(
      'Invalid URL: Unable to parse URL.',
    );

    expect(() => validateTextLinks('[test](foo.bar)', () => false)).toThrow(
      'Invalid URL: Unable to parse URL.',
    );
  });
});

describe('validateJsxLinks', () => {
  it.each([
    <Link href="mailto:foo@bar.com">Foo</Link>,
    <Text>
      <Link href="https://foo.bar">Foo</Link>
    </Text>,
    <Box>
      <Text>Foo</Text>
      <Text>
        <Link href="https://foo.bar">Bar</Link>
      </Text>
    </Box>,
  ])('does not throw for a safe JSX text component', async (element) => {
    const isOnPhishingList = () => false;

    expect(() => validateJsxLinks(element, isOnPhishingList)).not.toThrow();
  });

  it('does not throw for a JSX component with a link outside of a Link component', async () => {
    const isOnPhishingList = () => true;

    expect(() =>
      validateJsxLinks(
        <Box>
          <Text>Foo</Text>
          <Text>https://foo.bar</Text>
        </Box>,
        isOnPhishingList,
      ),
    ).not.toThrow();
  });

  it.each([
    <Link href="mailto:foo@bar.com">Foo</Link>,
    <Text>
      <Link href="https://foo.bar">Foo</Link>
    </Text>,
    <Box>
      <Text>Foo</Text>
      <Text>
        <Link href="https://foo.bar">Bar</Link>
      </Text>
    </Box>,
  ])('throws for an unsafe JSX text component', async (element) => {
    const isOnPhishingList = () => true;

    expect(() => validateJsxLinks(element, isOnPhishingList)).toThrow(
      'Invalid URL: The specified URL is not allowed.',
    );
  });

  it('throws if the protocol is not allowed', () => {
    const isOnPhishingList = () => false;

    expect(() =>
      validateJsxLinks(<Link href="ftp://foo.bar">Foo</Link>, isOnPhishingList),
    ).toThrow('Invalid URL: Protocol must be one of: https:, mailto:.');
  });

  it('throws if the URL cannot be parsed', () => {
    const isOnPhishingList = () => false;

    expect(() =>
      validateJsxLinks(<Link href="#foo">Foo</Link>, isOnPhishingList),
    ).toThrow('Invalid URL: Unable to parse URL.');
  });
});

describe('getTotalTextLength', () => {
  it('calculates total length', () => {
    expect(getTotalTextLength(text('foo'))).toBe(3);
  });

  it('calculates total length for nested text', () => {
    expect(
      getTotalTextLength(
        panel([text('foo'), panel([text('bar'), text('baz')])]),
      ),
    ).toBe(9);
  });

  it('calculates total length for nested text in rows', () => {
    expect(
      getTotalTextLength(panel([row('1', text('foo')), row('2', text('bar'))])),
    ).toBe(6);
  });

  it('ignores non text components', () => {
    expect(getTotalTextLength(panel([text('foo'), image('<svg />')]))).toBe(3);
  });
});

describe('hasChildren', () => {
  it.each([
    <Text>Foo</Text>,
    <Box>
      <Text>Foo</Text>
    </Box>,
  ])('returns true if the node has children', (value) => {
    expect(hasChildren(value)).toBe(true);
  });

  it('returns false if the node does not have children', () => {
    // @ts-expect-error - `children` is required.
    expect(hasChildren(<Box />)).toBe(false);
  });
});
