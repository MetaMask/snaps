/* eslint-disable @typescript-eslint/no-shadow */

import { panel, text } from './builder';
import type { Divider, Heading, Panel, Spinner, Text, Image } from './nodes';
import { NodeType } from './nodes';
import {
  assertIsComponent,
  assertLinksAreSafe,
  assertUILinksAreSafe,
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
  it('passes for valid links', () => {
    expect(() =>
      assertLinksAreSafe('https://foo.bar', () => false),
    ).not.toThrow();

    expect(() =>
      assertLinksAreSafe('mailto:foo@bar.baz', () => false),
    ).not.toThrow();
  });

  it('throws an error if an invalid link is found in text', () => {
    expect(() => assertLinksAreSafe('http://foo.bar', () => false)).toThrow(
      'Invalid URL: Protocol must be one of: https:, mailto:.',
    );

    expect(() =>
      assertLinksAreSafe('https://foo^bar.bar', () => false),
    ).toThrow('Invalid URL: invalid syntax.');
  });
});

describe('assertUILinksAreSafe', () => {
  it('does not throw for a safe text component', async () => {
    const isOnPhishingList = () => false;

    expect(() =>
      assertUILinksAreSafe(text('[foobar](https://foo.bar)'), isOnPhishingList),
    ).not.toThrow();

    expect(() =>
      assertUILinksAreSafe(
        panel([text('foobar'), text('[foobar](https://foo.bar)')]),
        isOnPhishingList,
      ),
    ).not.toThrow();
  });

  it('throws for an unsafe text component', async () => {
    const isOnPhishingList = () => true;

    expect(() =>
      assertUILinksAreSafe(
        text('This tests a link: https://foo.bar'),
        isOnPhishingList,
      ),
    ).toThrow('Invalid URL: The specified URL is not allowed.');

    expect(() =>
      assertUILinksAreSafe(
        text('This tests a [link](https://foo.bar)'),
        isOnPhishingList,
      ),
    ).toThrow('Invalid URL: The specified URL is not allowed.');

    expect(() =>
      assertUILinksAreSafe(
        panel([text('foobar'), text('This tests a [link](https://foo.bar)')]),
        isOnPhishingList,
      ),
    ).toThrow('Invalid URL: The specified URL is not allowed.');
  });
});
