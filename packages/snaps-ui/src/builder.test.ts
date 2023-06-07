import {
  button,
  copyable,
  divider,
  heading,
  panel,
  spinner,
  text,
} from './builder';
import { ButtonVariants, NodeType } from './nodes';

describe('copyable', () => {
  it('creates a copyable component', () => {
    expect(copyable({ value: 'Hello, world!' })).toStrictEqual({
      type: NodeType.Copyable,
      value: 'Hello, world!',
    });

    expect(copyable({ value: 'foo bar' })).toStrictEqual({
      type: NodeType.Copyable,
      value: 'foo bar',
    });
  });

  it('creates a copyable component using the shorthand form', () => {
    expect(copyable('Hello, world!')).toStrictEqual({
      type: NodeType.Copyable,
      value: 'Hello, world!',
    });

    expect(copyable('foo bar')).toStrictEqual({
      type: NodeType.Copyable,
      value: 'foo bar',
    });
  });

  it('validates the args', () => {
    // @ts-expect-error - Invalid args.
    expect(() => copyable({ value: 'foo', bar: 'baz' })).toThrow(
      'Invalid copyable component: At path: bar -- Expected a value of type `never`, but received: `"baz"`.',
    );

    // @ts-expect-error - Invalid args.
    expect(() => copyable({})).toThrow(
      'Invalid copyable component: At path: value -- Expected a string, but received: undefined.',
    );
  });
});

describe('divider', () => {
  it('creates a divider component', () => {
    expect(divider()).toStrictEqual({
      type: NodeType.Divider,
    });
  });

  it('validates the args', () => {
    // @ts-expect-error - Invalid args.
    expect(() => divider({ bar: 'baz' })).toThrow(
      'Invalid divider component: At path: bar -- Expected a value of type `never`, but received: `"baz"`.',
    );
  });
});

describe('heading', () => {
  it('creates a heading component', () => {
    expect(heading({ value: 'Hello, world!' })).toStrictEqual({
      type: NodeType.Heading,
      value: 'Hello, world!',
    });

    expect(heading({ value: 'foo bar' })).toStrictEqual({
      type: NodeType.Heading,
      value: 'foo bar',
    });
  });

  it('creates a heading component using the shorthand form', () => {
    expect(heading('Hello, world!')).toStrictEqual({
      type: NodeType.Heading,
      value: 'Hello, world!',
    });

    expect(heading('foo bar')).toStrictEqual({
      type: NodeType.Heading,
      value: 'foo bar',
    });
  });

  it('validates the args', () => {
    // @ts-expect-error - Invalid args.
    expect(() => heading({ value: 'foo', bar: 'baz' })).toThrow(
      'Invalid heading component: At path: bar -- Expected a value of type `never`, but received: `"baz"`.',
    );

    // @ts-expect-error - Invalid args.
    expect(() => heading({})).toThrow(
      'Invalid heading component: At path: value -- Expected a string, but received: undefined.',
    );
  });
});

describe('panel', () => {
  it('creates a panel component', () => {
    expect(
      panel({ children: [heading({ value: 'Hello, world!' })] }),
    ).toStrictEqual({
      type: NodeType.Panel,
      children: [
        {
          type: NodeType.Heading,
          value: 'Hello, world!',
        },
      ],
    });

    expect(
      panel({
        children: [panel({ children: [heading({ value: 'Hello, world!' })] })],
      }),
    ).toStrictEqual({
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
    });

    expect(
      panel({
        children: [
          text({ value: 'foo' }),
          button({
            variant: ButtonVariants.Primary,
            value: 'bar',
            name: 'bar',
          }),
        ],
      }),
    ).toStrictEqual({
      type: NodeType.Panel,
      children: [
        { type: NodeType.Text, value: 'foo' },
        {
          type: NodeType.Button,
          variant: ButtonVariants.Primary,
          value: 'bar',
          name: 'bar',
        },
      ],
    });
  });

  it('creates a panel component using the shorthand form', () => {
    expect(panel([heading('Hello, world!')])).toStrictEqual({
      type: NodeType.Panel,
      children: [
        {
          type: NodeType.Heading,
          value: 'Hello, world!',
        },
      ],
    });

    expect(panel([panel([heading('Hello, world!')])])).toStrictEqual({
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
    });
  });

  it('validates the args', () => {
    // @ts-expect-error - Invalid args.
    expect(() => panel({ children: [], bar: 'baz' })).toThrow(
      'Invalid panel component: At path: bar -- Expected a value of type `never`, but received: `"baz"`.',
    );

    // @ts-expect-error - Invalid args.
    expect(() => panel({})).toThrow(
      'Invalid panel component: At path: children -- Expected an array value, but received: undefined.',
    );
  });
});

describe('spinner', () => {
  it('creates a spinner component', () => {
    expect(spinner()).toStrictEqual({
      type: NodeType.Spinner,
    });
  });

  it('validates the args', () => {
    // @ts-expect-error - Invalid args.
    expect(() => spinner({ bar: 'baz' })).toThrow(
      'Invalid spinner component: At path: bar -- Expected a value of type `never`, but received: `"baz"`.',
    );
  });
});

describe('text', () => {
  it('creates a text component', () => {
    expect(text({ value: 'Hello, world!' })).toStrictEqual({
      type: NodeType.Text,
      value: 'Hello, world!',
    });

    expect(text({ value: 'foo bar' })).toStrictEqual({
      type: NodeType.Text,
      value: 'foo bar',
    });
  });

  it('creates a text component using the shorthand form', () => {
    expect(text('Hello, world!')).toStrictEqual({
      type: NodeType.Text,
      value: 'Hello, world!',
    });

    expect(text('foo bar')).toStrictEqual({
      type: NodeType.Text,
      value: 'foo bar',
    });
  });

  it('validates the args', () => {
    // @ts-expect-error - Invalid args.
    expect(() => text({ value: 'foo', bar: 'baz' })).toThrow(
      'Invalid text component: At path: bar -- Expected a value of type `never`, but received: `"baz"`.',
    );

    // @ts-expect-error - Invalid args.
    expect(() => text({})).toThrow(
      'Invalid text component: At path: value -- Expected a string, but received: undefined.',
    );
  });
});

describe('button', () => {
  it('creates a button component', () => {
    expect(
      button({
        variant: ButtonVariants.Primary,
        value: 'Hello, world!',
        name: 'myButton',
      }),
    ).toStrictEqual({
      type: NodeType.Button,
      variant: ButtonVariants.Primary,
      name: 'myButton',
      value: 'Hello, world!',
    });

    expect(
      button({
        value: 'Hello, world!',
      }),
    ).toStrictEqual({
      type: NodeType.Button,
      value: 'Hello, world!',
    });
  });

  it('creates a text component using the shorthand form', () => {
    expect(
      button(ButtonVariants.Primary, 'Hello, world!', 'myButton'),
    ).toStrictEqual({
      type: NodeType.Button,
      value: 'Hello, world!',
      variant: ButtonVariants.Primary,
      name: 'myButton',
    });

    expect(text('foo bar')).toStrictEqual({
      type: NodeType.Text,
      value: 'foo bar',
    });
  });

  it('validates the args', () => {
    // @ts-expect-error - Invalid args.
    expect(() => button({ value: 'foo', bar: 'baz' })).toThrow(
      'Invalid button component: At path: bar -- Expected a value of type `never`, but received: `"baz"`.',
    );

    // @ts-expect-error - Invalid args.
    expect(() => button({})).toThrow(
      'Invalid button component: At path: value -- Expected a string, but received: undefined.',
    );
  });
});
