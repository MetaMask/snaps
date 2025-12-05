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
  AssetSelector,
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
  type JSXElement,
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
  validateTextLinks,
  walkJsx,
  getJsxChildren,
  serialiseJsx,
  validateLink,
  validateJsxElements,
  validateAssetSelector,
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
      <Button name="foo" variant="primary">
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
      <Button name="bar" variant="destructive">
        bar
      </Button>,
    );
  });

  it('returns the JSX element for a button component with a type', () => {
    expect(
      getJsxElementFromComponent(
        button({
          buttonType: 'submit',
          name: 'bar',
          value: 'bar',
        }),
      ),
    ).toStrictEqual(
      <Button name="bar" type="submit">
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
        <Button name={undefined} variant={undefined}>
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

  it('returns the JSX element for an input component with a label and error', () => {
    expect(
      getJsxElementFromComponent(
        input({
          name: 'foo',
          label: 'bar',
          error: 'baz',
        }),
      ),
    ).toStrictEqual(
      <Field label="bar" error="baz">
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

  it('returns the JSX element for a row component with a variant', () => {
    expect(
      getJsxElementFromComponent(row('foo', text('bar'), 'critical')),
    ).toStrictEqual(
      <Row label="foo" variant="critical">
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
              <Button name={undefined} variant={undefined}>
                button
              </Button>
            </Form>
          </Box>
        </Box>
      </Box>,
    );
  });
});

describe('validateLink', () => {
  it('passes for a valid link', () => {
    const fn = jest.fn().mockReturnValue(false);

    expect(() => validateLink('https://foo.bar', fn, fn)).not.toThrow();
    expect(() => validateLink('mailto:foo@bar.com', fn, fn)).not.toThrow();

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith('https://foo.bar/');
    expect(fn).toHaveBeenCalledWith('https://bar.com');
  });

  it('passes for a valid list of emails', () => {
    const fn = jest.fn().mockReturnValue(false);
    const getSnap = jest.fn();

    expect(() =>
      validateLink('mailto:foo@bar.com,bar@baz.com,baz@qux.com', fn, getSnap),
    ).not.toThrow();

    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveBeenCalledWith('https://bar.com');
    expect(fn).toHaveBeenCalledWith('https://baz.com');
    expect(fn).toHaveBeenCalledWith('https://qux.com');
  });

  it('passes for a valid email with a parameter', () => {
    const fn = jest.fn().mockReturnValue(false);
    const getSnap = jest.fn();

    expect(() =>
      validateLink('mailto:foo@bar.com?subject=Subject', fn, getSnap),
    ).not.toThrow();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('https://bar.com');
  });

  it('throws an error for an invalid protocol', () => {
    const fn = jest.fn().mockReturnValue(false);
    const getSnap = jest.fn();

    expect(() => validateLink('http://foo.bar', fn, getSnap)).toThrow(
      'Invalid URL: Protocol must be one of: https:, mailto:, metamask:.',
    );

    expect(fn).not.toHaveBeenCalled();
  });

  it('throws an error if the snap being navigated to is not installed', () => {
    const fn = jest.fn().mockReturnValue(false);

    expect(() =>
      validateLink(
        'metamask://snap/npm:@metamask/examplesnap/home',
        fn,
        jest.fn().mockReturnValue(false),
      ),
    ).toThrow('Invalid URL: The Snap being navigated to is not installed.');

    expect(fn).not.toHaveBeenCalled();
  });

  it('throws an error for an invalid URL', () => {
    const fn = jest.fn().mockReturnValue(false);

    expect(() => validateLink('foo.bar', fn, fn)).toThrow(
      'Invalid URL: Unable to parse URL.',
    );

    expect(fn).not.toHaveBeenCalled();
  });

  it('throws an error for a phishing link', () => {
    const fn = jest.fn().mockReturnValue(true);

    expect(() =>
      validateLink('https://test.metamask-phishing.io', fn, fn),
    ).toThrow('Invalid URL: The specified URL is not allowed.');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('https://test.metamask-phishing.io/');
  });

  it('throws an error for a phishing email', () => {
    const fn = jest.fn().mockReturnValue(true);

    expect(() =>
      validateLink('mailto:foo@test.metamask-phishing.io', fn, fn),
    ).toThrow('Invalid URL: The specified URL is not allowed.');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('https://test.metamask-phishing.io');
  });

  it('throws an error for a phishing email when using multiple emails', () => {
    const fn = jest.fn().mockImplementation((email) => {
      if (email === 'https://test.metamask-phishing.io') {
        return true;
      }

      return false;
    });
    const getSnap = jest.fn();

    expect(() =>
      validateLink(
        'mailto:foo@test.metamask-phishing.io,foo@bar.com',
        fn,
        getSnap,
      ),
    ).toThrow('Invalid URL: The specified URL is not allowed.');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('https://test.metamask-phishing.io');
  });

  it('throws an error for a phishing email when using parameters', () => {
    const fn = jest.fn().mockImplementation((email) => {
      if (email === 'https://test.metamask-phishing.io') {
        return true;
      }

      return false;
    });
    const getSnap = jest.fn();

    expect(() =>
      validateLink(
        'mailto:foo@bar.com,foo@test.metamask-phishing.io?subject=Subject',
        fn,
        getSnap,
      ),
    ).toThrow('Invalid URL: The specified URL is not allowed.');

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith('https://bar.com');
    expect(fn).toHaveBeenCalledWith('https://test.metamask-phishing.io');
  });
});

describe('validateTextLinks', () => {
  it('passes for valid links', () => {
    expect(() =>
      validateTextLinks('[test](https://foo.bar)', () => false, jest.fn()),
    ).not.toThrow();

    expect(() =>
      validateTextLinks('[test](mailto:foo@bar.baz)', () => false, jest.fn()),
    ).not.toThrow();

    expect(() =>
      validateTextLinks('[](https://foo.bar)', () => false, jest.fn()),
    ).not.toThrow();

    expect(() =>
      validateTextLinks('[[test]](https://foo.bar)', () => false, jest.fn()),
    ).not.toThrow();

    expect(() =>
      validateTextLinks(
        '[test](https://foo.bar "foo bar baz")',
        () => false,
        jest.fn(),
      ),
    ).not.toThrow();

    expect(() =>
      validateTextLinks('<https://foo.bar>', () => false, jest.fn()),
    ).not.toThrow();

    expect(() =>
      validateTextLinks(
        `[foo][1]
         [1]: https://foo.bar`,
        () => false,
        jest.fn(),
      ),
    ).not.toThrow();

    expect(() =>
      validateTextLinks(
        `[foo][1]
         [1]: https://foo.bar "foo bar baz"`,
        () => false,
        jest.fn(),
      ),
    ).not.toThrow();
  });

  it('passes for non-links', () => {
    expect(() =>
      validateTextLinks(
        'Hello **http://localhost:3000**',
        () => false,
        jest.fn(),
      ),
    ).not.toThrow();
  });

  it('throws an error if an invalid link is found in text', () => {
    expect(() =>
      validateTextLinks('[test](http://foo.bar)', () => false, jest.fn()),
    ).toThrow(
      'Invalid URL: Protocol must be one of: https:, mailto:, metamask:.',
    );

    expect(() =>
      validateTextLinks('[[test]](http://foo.bar)', () => false, jest.fn()),
    ).toThrow(
      'Invalid URL: Protocol must be one of: https:, mailto:, metamask:.',
    );

    expect(() =>
      validateTextLinks('<http://foo.bar>', () => false, jest.fn()),
    ).toThrow(
      'Invalid URL: Protocol must be one of: https:, mailto:, metamask:.',
    );

    expect(() =>
      validateTextLinks(
        '[test](http://foo.bar "foo bar baz")',
        () => false,
        jest.fn(),
      ),
    ).toThrow(
      'Invalid URL: Protocol must be one of: https:, mailto:, metamask:.',
    );

    expect(() =>
      validateTextLinks(
        '[foo][1]\n\n[1]: http://foo.bar',
        () => false,
        jest.fn(),
      ),
    ).toThrow(
      'Invalid URL: Protocol must be one of: https:, mailto:, metamask:.',
    );

    expect(() =>
      validateTextLinks(
        `[foo][1]\n\n[1]: http://foo.bar "foo bar baz"`,
        () => false,
        jest.fn(),
      ),
    ).toThrow(
      'Invalid URL: Protocol must be one of: https:, mailto:, metamask:.',
    );

    expect(() =>
      validateTextLinks('[test](#code)', () => false, jest.fn()),
    ).toThrow('Invalid URL: Unable to parse URL.');

    expect(() =>
      validateTextLinks('[test](foo.bar)', () => false, jest.fn()),
    ).toThrow('Invalid URL: Unable to parse URL.');
  });
});

describe('validateAssetSelector', () => {
  it('passes if the address is available in the client', () => {
    const getAccountByAddress = jest.fn().mockReturnValue({
      id: 'foo',
    });

    expect(() =>
      validateAssetSelector(
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        getAccountByAddress,
      ),
    ).not.toThrow();
  });

  it('throws if the address is not available in the client', () => {
    const getAccountByAddress = jest.fn().mockReturnValue(undefined);

    expect(() =>
      validateAssetSelector(
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        getAccountByAddress,
      ),
    ).toThrow(
      `Could not find account for address: solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv`,
    );
  });
});

describe('validateJsxElements', () => {
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

    expect(() =>
      validateJsxElements(element, {
        isOnPhishingList,
        getSnap: jest.fn(),
        getAccountByAddress: jest.fn(),
        hasPermission: jest.fn(),
      }),
    ).not.toThrow();
  });

  it('does not throw for a JSX component with a link outside of a Link component', async () => {
    const isOnPhishingList = () => true;

    expect(() =>
      validateJsxElements(
        <Box>
          <Text>Foo</Text>
          <Text>https://foo.bar</Text>
        </Box>,
        {
          isOnPhishingList,
          getSnap: jest.fn(),
          getAccountByAddress: jest.fn(),
          hasPermission: jest.fn(),
        },
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

    expect(() =>
      validateJsxElements(element, {
        isOnPhishingList,
        getSnap: jest.fn(),
        getAccountByAddress: jest.fn(),
        hasPermission: jest.fn(),
      }),
    ).toThrow('Invalid URL: The specified URL is not allowed.');
  });

  it('throws if the protocol is not allowed', () => {
    const isOnPhishingList = () => false;

    expect(() =>
      validateJsxElements(<Link href="ftp://foo.bar">Foo</Link>, {
        isOnPhishingList,
        getSnap: jest.fn(),
        getAccountByAddress: jest.fn(),
        hasPermission: jest.fn(),
      }),
    ).toThrow(
      'Invalid URL: Protocol must be one of: https:, mailto:, metamask:.',
    );
  });

  it('throws if the URL cannot be parsed', () => {
    const isOnPhishingList = () => false;

    expect(() =>
      validateJsxElements(<Link href="#foo">Foo</Link>, {
        isOnPhishingList,
        getSnap: jest.fn(),
        getAccountByAddress: jest.fn(),
        hasPermission: jest.fn(),
      }),
    ).toThrow('Invalid URL: Unable to parse URL.');
  });

  it('passes for a valid AssetSelector', () => {
    const getAccountByAddress = jest.fn().mockReturnValue({
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    });

    expect(() =>
      validateJsxElements(
        <AssetSelector
          name="bar"
          addresses={[
            'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
          ]}
        />,
        {
          getAccountByAddress,
          isOnPhishingList: jest.fn(),
          getSnap: jest.fn(),
          hasPermission: jest.fn(),
        },
      ),
    ).not.toThrow();
  });

  it('throws for an invalid AssetSelector', () => {
    const getAccountByAddress = jest.fn().mockReturnValue(undefined);

    expect(() =>
      validateJsxElements(
        <AssetSelector
          name="bar"
          addresses={[
            'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
          ]}
        />,
        {
          getAccountByAddress,
          isOnPhishingList: jest.fn(),
          getSnap: jest.fn(),
          hasPermission: jest.fn(),
        },
      ),
    ).toThrow(
      'Could not find account for address: solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
    );
  });

  it('throws if the Snap tries to use external images without permission', () => {
    expect(() =>
      validateJsxElements(<Image src="https://metamask.io/foo.png" />, {
        getAccountByAddress: jest.fn(),
        isOnPhishingList: jest.fn(),
        getSnap: jest.fn(),
        hasPermission: jest.fn().mockReturnValue(false),
      }),
    ).toThrow(
      'Using external images is only permitted with the network access endowment.',
    );
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

describe('getJsxChildren', () => {
  it('returns the children of a JSX element', () => {
    const element = (
      <Box>
        <Text>Foo</Text>
        <Text>Bar</Text>
      </Box>
    );

    expect(getJsxChildren(element)).toStrictEqual(element.props.children);
  });

  it('returns the children of a JSX element with one child', () => {
    const element = (
      <Box>
        <Text>Foo</Text>
      </Box>
    );

    expect(getJsxChildren(element)).toStrictEqual([element.props.children]);
  });

  it('returns an empty array if the JSX element does not have children', () => {
    // @ts-expect-error - `children` is required.
    const element = <Box />;

    expect(getJsxChildren(element)).toStrictEqual([]);
  });

  it('returns an empty array if the child is null', () => {
    const element = <Box>{null}</Box>;

    expect(getJsxChildren(element)).toStrictEqual([]);
  });

  it('removes null children from the array', () => {
    const element = (
      <Box>
        <Text>Hello</Text>
        {null}
        <Text>World</Text>
      </Box>
    );

    expect(getJsxChildren(element)).toStrictEqual([
      <Text>Hello</Text>,
      <Text>World</Text>,
    ]);
  });

  it('removes falsy children from the array', () => {
    const element = (
      <Box>
        <Text>Hello</Text>
        {/* eslint-disable-next-line no-constant-binary-expression */}
        {false && <Text>Foo</Text>}
        <Text>World</Text>
      </Box>
    );

    expect(getJsxChildren(element)).toStrictEqual([
      <Text>Hello</Text>,
      <Text>World</Text>,
    ]);
  });

  it('removes falsy children from a text element', () => {
    const element = (
      <Text>
        Hello
        {/* eslint-disable-next-line no-constant-binary-expression */}
        {false && 'Foo'}
        World
      </Text>
    );

    expect(getJsxChildren(element)).toStrictEqual(['Hello', 'World']);
  });

  it('removes `true` children from the array', () => {
    const element = (
      <Text>
        Hello
        {true}
        World
      </Text>
    );

    expect(getJsxChildren(element)).toStrictEqual(['Hello', 'World']);
  });

  it('flattens the children array', () => {
    const element = (
      <Box>
        <Text>Hello</Text>
        {[1, 2, 3].map((value) => (
          <Text>{value.toString()}</Text>
        ))}
        <Text>World</Text>
      </Box>
    );

    const children = getJsxChildren(element);

    expect(element.props.children).toHaveLength(3);
    expect(children).toHaveLength(5);
    expect(children).toStrictEqual([
      <Text>Hello</Text>,
      <Text>1</Text>,
      <Text>2</Text>,
      <Text>3</Text>,
      <Text>World</Text>,
    ]);
  });
});

describe('walkJsx', () => {
  it('calls the callback on each node', () => {
    const tree = (
      <Box>
        <Row label="row">
          <Text>Hello</Text>
        </Row>
        <Image src="<svg />" />
      </Box>
    );

    const callback = jest.fn();
    walkJsx(tree, callback);

    expect(callback).toHaveBeenCalledTimes(4);
    expect(callback).toHaveBeenCalledWith(tree, 0);
    expect(callback).toHaveBeenCalledWith(tree.props.children[0], 1);
    expect(callback).toHaveBeenCalledWith(
      tree.props.children[0].props.children,
      2,
    );
    expect(callback).toHaveBeenCalledWith(tree.props.children[1], 1);
  });

  it('calls the callback on each node in an array of nodes', () => {
    const tree = [
      <Box>
        <Row label="row">
          <Text>Hello</Text>
        </Row>
        <Image src="<svg />" />
      </Box>,
      <Text>World</Text>,
    ];

    const callback = jest.fn();
    walkJsx(tree, callback);

    expect(callback).toHaveBeenCalledTimes(5);
    expect(callback).toHaveBeenCalledWith(tree[0], 0);
    expect(callback).toHaveBeenCalledWith(tree[0].props.children[0], 1);
    expect(callback).toHaveBeenCalledWith(
      tree[0].props.children[0].props.children,
      2,
    );
    expect(callback).toHaveBeenCalledWith(tree[0].props.children[1], 1);
    expect(callback).toHaveBeenCalledWith(tree[1], 0);
  });

  it("returns the result of the callback if it's not undefined", () => {
    const tree = (
      <Box>
        <Row label="row">
          <Text>Hello</Text>
        </Row>
        <Image src="<svg />" />
      </Box>
    );

    const callback = jest.fn((element: JSXElement) => {
      if (element.type === 'Text') {
        return element.props.children;
      }

      return undefined;
    });

    const result = walkJsx(tree, callback);
    expect(result).toBe('Hello');
  });

  it('returns the result of the callback if it is not undefined in an array of nodes', () => {
    const tree = [
      <Box>
        <Row label="row">
          <Text>Hello</Text>
        </Row>
        <Image src="<svg />" />
      </Box>,
      <Text>World</Text>,
    ];

    const callback = jest.fn((element: JSXElement) => {
      if (element.type === 'Text') {
        return element.props.children;
      }

      return undefined;
    });

    const result = walkJsx(tree, callback);
    expect(result).toBe('Hello');
  });

  it('returns undefined if the callback never returns a value', () => {
    const tree = (
      <Box>
        <Row label="row">
          <Text>Hello</Text>
        </Row>
        <Image src="<svg />" />
      </Box>
    );

    const callback = jest.fn();
    const result = walkJsx(tree, callback);
    expect(result).toBeUndefined();
  });
});

describe('serialiseJsx', () => {
  it('serialises a JSX element', () => {
    expect(
      serialiseJsx(
        <Box>
          <Text>Hello</Text>
        </Box>,
        0,
      ),
    ).toMatchInlineSnapshot(`
      "<Box>
        <Text>
          Hello
        </Text>
      </Box>"
    `);
  });

  it('serialises a JSX element with props', () => {
    expect(
      serialiseJsx(
        <Form name="foo">
          <Field label="Foo">
            <Input name="input" type="text" />
            <Button variant="primary">Primary button</Button>
          </Field>
          <Field label="Bar">
            <Input name="input" type="text" />
            <Button variant="destructive">Secondary button</Button>
          </Field>
        </Form>,
        0,
      ),
    ).toMatchInlineSnapshot(`
      "<Form name="foo">
        <Field label="Foo">
          <Input name="input" type="text" />
          <Button variant="primary">
            Primary button
          </Button>
        </Field>
        <Field label="Bar">
          <Input name="input" type="text" />
          <Button variant="destructive">
            Secondary button
          </Button>
        </Field>
      </Form>"
    `);
  });

  it('serialises a JSX element with non-string props', () => {
    expect(
      serialiseJsx(
        // @ts-expect-error - Invalid prop.
        <Box foo={0} />,
      ),
    ).toMatchInlineSnapshot(`"<Box foo={0} />"`);
  });

  it('serialises a JSX element with null children', () => {
    expect(serialiseJsx(<Box>{null}</Box>)).toMatchInlineSnapshot(`
      "<Box>
      </Box>"
    `);
  });
});
