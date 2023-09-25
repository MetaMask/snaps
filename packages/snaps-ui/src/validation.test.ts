import { link, panel, text } from './builder';
import type {
  Divider,
  Heading,
  Link,
  Panel,
  Spinner,
  Text,
  Image,
} from './nodes';
import { NodeType } from './nodes';
import {
  assertIsComponent,
  assertLinksAreSafe,
  isComponent,
} from './validation';

describe('isComponent', () => {
  it('returns true for a divider component', () => {
    const divider: Divider = {
      type: NodeType.Divider,
    };

    expect(isComponent(divider)).toBe(true);
  });

  it('returns true for a heading component', () => {
    const heading: Heading = {
      type: NodeType.Heading,
      value: 'Hello, world!',
    };

    expect(isComponent(heading)).toBe(true);
  });

  it('returns true for a panel component', () => {
    const panel: Panel = {
      type: NodeType.Panel,
      children: [
        {
          type: NodeType.Heading,
          value: 'Hello, world!',
        },
      ],
    };

    expect(isComponent(panel)).toBe(true);
  });

  it('returns true for nested panels', () => {
    const panel: Panel = {
      type: NodeType.Panel,
      children: [
        {
          type: NodeType.Panel,
          children: [
            {
              type: NodeType.Heading,
              value: 'Hello, world!',
            },
          ],
        },
      ],
    };

    expect(isComponent(panel)).toBe(true);
  });

  it('returns true for a spinner component', () => {
    const spinner: Spinner = {
      type: NodeType.Spinner,
    };

    expect(isComponent(spinner)).toBe(true);
  });

  it('returns true for a text component', () => {
    const text: Text = {
      type: NodeType.Text,
      value: 'Hello, world!',
    };

    expect(isComponent(text)).toBe(true);
  });

  it('returns true for an image component', () => {
    const image: Image = {
      type: NodeType.Image,
      value: '<svg></svg>',
    };

    expect(isComponent(image)).toBe(true);
  });
  it('returns true for a link component', () => {
    const link: Link = {
      type: NodeType.Link,
      value: 'Hello, world!',
      url: 'https://foo.bar',
    };

    expect(isComponent(link)).toBe(true);
  });

  it.each([
    true,
    false,
    null,
    undefined,
    0,
    1,
    '',
    'Hello, world!',
    {},
    { type: NodeType.Heading },
    { type: NodeType.Heading, foo: 'bar' },
    { type: NodeType.Heading, text: 0 },
    { type: 'foo' },
  ])(`returns false for %p`, (value) => {
    expect(isComponent(value)).toBe(false);
  });
});

describe('assertIsComponent', () => {
  it('does not throw for a divider component', () => {
    const divider: Divider = {
      type: NodeType.Divider,
    };

    expect(() => assertIsComponent(divider)).not.toThrow();
  });

  it('does not throw for a heading component', () => {
    const heading: Heading = {
      type: NodeType.Heading,
      value: 'Hello, world!',
    };

    expect(() => assertIsComponent(heading)).not.toThrow();
  });

  it('does not throw for a panel component', () => {
    const panel: Panel = {
      type: NodeType.Panel,
      children: [
        {
          type: NodeType.Heading,
          value: 'Hello, world!',
        },
      ],
    };

    expect(() => assertIsComponent(panel)).not.toThrow();
  });

  it('does not throw for nested panels', () => {
    const panel: Panel = {
      type: NodeType.Panel,
      children: [
        {
          type: NodeType.Panel,
          children: [
            {
              type: NodeType.Heading,
              value: 'Hello, world!',
            },
          ],
        },
      ],
    };

    expect(() => assertIsComponent(panel)).not.toThrow();
  });

  it('does not throw for a spinner component', () => {
    const spinner: Spinner = {
      type: NodeType.Spinner,
    };

    expect(() => assertIsComponent(spinner)).not.toThrow();
  });

  it('does not throw for a text component', () => {
    const text: Text = {
      type: NodeType.Text,
      value: 'Hello, world!',
    };

    expect(() => assertIsComponent(text)).not.toThrow();
  });

  it('does not throw for a link component', () => {
    const link: Link = {
      type: NodeType.Link,
      value: 'Hello, world!',
      url: 'https://foo.bar',
    };

    expect(() => assertIsComponent(link)).not.toThrow();
  });

  it.each([
    true,
    false,
    null,
    undefined,
    0,
    1,
    '',
    'Hello, world!',
    {},
    { type: NodeType.Heading },
    { type: NodeType.Heading, foo: 'bar' },
    { type: NodeType.Heading, text: 0 },
    { type: 'foo' },
  ])(`throws for %p`, (value) => {
    expect(() => assertIsComponent(value)).toThrow('Invalid component:');
  });
});

describe('assertLinksAreSafe', () => {
  it('does not throw for a safe link', () => {
    const isOnPhishingList = () => false;

    expect(async () =>
      assertLinksAreSafe(
        link('Hello, world!', 'https://foo.bar'),
        isOnPhishingList,
      ),
    ).not.toThrow();
  });

  it('throws for an unsafe link', () => {
    const isOnPhishingList = () => true;

    expect(async () =>
      assertLinksAreSafe(
        link('Hello, world!', 'https://foo.bar'),
        isOnPhishingList,
      ),
    ).toThrow('The provided URL is detected as phishing.');
  });

  it('can crawl into nested components', () => {
    const isOnPhishingList = () => true;

    expect(async () =>
      assertLinksAreSafe(
        panel([
          text('Hello, world!'),
          link('Hello, world!', 'https://foo.bar'),
        ]),
        isOnPhishingList,
      ),
    ).toThrow('The provided URL is detected as phishing.');
  });
});
