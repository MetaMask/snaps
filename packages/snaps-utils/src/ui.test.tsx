import {
  panel,
  text,
  row,
  address,
  image,
  form,
  button,
} from '@metamask/snaps-sdk';
import { Box, Link, Text } from '@metamask/snaps-sdk/jsx';

import {
  validateTextLinks,
  validateComponentLinks,
  getTotalTextLength,
  hasChildren,
} from './ui';

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

describe('validateComponentLinks', () => {
  it('does not throw for a safe markdown text component', async () => {
    const isOnPhishingList = () => false;

    expect(() =>
      validateComponentLinks(
        text('[foobar](https://foo.bar)'),
        isOnPhishingList,
      ),
    ).not.toThrow();

    expect(() =>
      validateComponentLinks(
        panel([text('foobar'), text('[foobar](https://foo.bar)')]),
        isOnPhishingList,
      ),
    ).not.toThrow();

    expect(() =>
      validateComponentLinks(
        panel([
          row('foo', text('[bar](https://foo.bar)')),
          row('baz', address('0x4bbeeb066ed09b7aed07bf39eee0460dfa261520')),
        ]),
        isOnPhishingList,
      ),
    ).not.toThrow();
  });

  it.each([
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
      validateComponentLinks(element, isOnPhishingList),
    ).not.toThrow();
  });

  it('does not throw for a JSX component with a link outside of a Link component', async () => {
    const isOnPhishingList = () => true;

    expect(() =>
      validateComponentLinks(
        <Box>
          <Text>Foo</Text>
          <Text>https://foo.bar</Text>
        </Box>,
        isOnPhishingList,
      ),
    ).not.toThrow();
  });

  it('throws for an unsafe text component', async () => {
    const isOnPhishingList = () => true;

    expect(() =>
      validateComponentLinks(
        text('This tests a [link](https://foo.bar)'),
        isOnPhishingList,
      ),
    ).toThrow('Invalid URL: The specified URL is not allowed.');

    expect(() =>
      validateComponentLinks(
        panel([text('foobar'), text('This tests a [link](https://foo.bar)')]),
        isOnPhishingList,
      ),
    ).toThrow('Invalid URL: The specified URL is not allowed.');

    expect(() =>
      validateComponentLinks(
        panel([
          row('foo', text('This tests a [link](https://foo.bar)')),
          row('bar', address('0x4bbeeb066ed09b7aed07bf39eee0460dfa261520')),
        ]),
        isOnPhishingList,
      ),
    ).toThrow('Invalid URL: The specified URL is not allowed.');
  });

  it.each([
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

    expect(() => validateComponentLinks(element, isOnPhishingList)).toThrow(
      'Invalid URL: The specified URL is not allowed.',
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
    panel([text('foo')]),
    form('bar', [button('foo')]),
    <Text>Foo</Text>,
    <Box>
      <Text>Foo</Text>
    </Box>,
  ])('returns true if the node has children', (value) => {
    expect(hasChildren(value)).toBe(true);
  });

  it('returns false if the node does not have children', () => {
    expect(hasChildren(text('foo'))).toBe(false);
  });
});
