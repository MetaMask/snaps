import {
  copyable,
  divider,
  heading,
  panel,
  spacer,
  spinner,
  text,
} from './builder';
import { NodeType } from './nodes';

describe('copyable', () => {
  it('creates a copyable component', () => {
    expect(copyable({ text: 'Hello, world!' })).toStrictEqual({
      type: NodeType.Copyable,
      text: 'Hello, world!',
    });

    expect(copyable({ text: 'foo bar' })).toStrictEqual({
      type: NodeType.Copyable,
      text: 'foo bar',
    });
  });

  it('creates a copyable component using the shorthand form', () => {
    expect(copyable('Hello, world!')).toStrictEqual({
      type: NodeType.Copyable,
      text: 'Hello, world!',
    });

    expect(copyable('foo bar')).toStrictEqual({
      type: NodeType.Copyable,
      text: 'foo bar',
    });
  });

  it('validates the args', () => {
    // @ts-expect-error - Invalid args.
    expect(() => copyable({ type: NodeType.Divider })).toThrow(
      'Invalid copyable component: At path: type -- Expected the literal `"copyable"`, but received: "divider".',
    );

    // @ts-expect-error - Invalid args.
    expect(() => copyable({})).toThrow(
      'Invalid copyable component: At path: text -- Expected a string, but received: undefined.',
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
    expect(() => divider({ type: NodeType.Heading })).toThrow(
      'Invalid divider component: At path: type -- Expected the literal `"divider"`, but received: "heading".',
    );
  });
});

describe('heading', () => {
  it('creates a heading component', () => {
    expect(heading({ text: 'Hello, world!' })).toStrictEqual({
      type: NodeType.Heading,
      text: 'Hello, world!',
    });

    expect(heading({ text: 'foo bar' })).toStrictEqual({
      type: NodeType.Heading,
      text: 'foo bar',
    });
  });

  it('creates a heading component using the shorthand form', () => {
    expect(heading('Hello, world!')).toStrictEqual({
      type: NodeType.Heading,
      text: 'Hello, world!',
    });

    expect(heading('foo bar')).toStrictEqual({
      type: NodeType.Heading,
      text: 'foo bar',
    });
  });

  it('validates the args', () => {
    // @ts-expect-error - Invalid args.
    expect(() => heading({ type: NodeType.Divider })).toThrow(
      'Invalid heading component: At path: type -- Expected the literal `"heading"`, but received: "divider".',
    );

    // @ts-expect-error - Invalid args.
    expect(() => heading({})).toThrow(
      'Invalid heading component: At path: text -- Expected a string, but received: undefined.',
    );
  });
});

describe('panel', () => {
  it('creates a panel component', () => {
    expect(
      panel({ children: [heading({ text: 'Hello, world!' })] }),
    ).toStrictEqual({
      type: NodeType.Panel,
      children: [
        {
          type: NodeType.Heading,
          text: 'Hello, world!',
        },
      ],
    });

    expect(
      panel({
        children: [panel({ children: [heading({ text: 'Hello, world!' })] })],
      }),
    ).toStrictEqual({
      type: NodeType.Panel,
      children: [
        {
          type: NodeType.Panel,
          children: [
            {
              type: NodeType.Heading,
              text: 'Hello, world!',
            },
          ],
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
          text: 'Hello, world!',
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
              text: 'Hello, world!',
            },
          ],
        },
      ],
    });
  });

  it('validates the args', () => {
    // @ts-expect-error - Invalid args.
    expect(() => panel({ type: NodeType.Divider })).toThrow(
      'Invalid panel component: At path: type -- Expected the literal `"panel"`, but received: "divider".',
    );

    // @ts-expect-error - Invalid args.
    expect(() => panel({})).toThrow(
      'Invalid panel component: At path: children -- Expected an array value, but received: undefined.',
    );
  });
});

describe('spacer', () => {
  it('creates a spacer component', () => {
    expect(spacer()).toStrictEqual({
      type: NodeType.Spacer,
    });
  });

  it('validates the args', () => {
    // @ts-expect-error - Invalid args.
    expect(() => spacer({ type: NodeType.Divider })).toThrow(
      'Invalid spacer component: At path: type -- Expected the literal `"spacer"`, but received: "divider".',
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
    expect(() => spinner({ type: NodeType.Divider })).toThrow(
      'Invalid spinner component: At path: type -- Expected the literal `"spinner"`, but received: "divider".',
    );
  });
});

describe('text', () => {
  it('creates a text component', () => {
    expect(text({ text: 'Hello, world!' })).toStrictEqual({
      type: NodeType.Text,
      text: 'Hello, world!',
    });

    expect(text({ text: 'foo bar' })).toStrictEqual({
      type: NodeType.Text,
      text: 'foo bar',
    });
  });

  it('creates a text component using the shorthand form', () => {
    expect(text('Hello, world!')).toStrictEqual({
      type: NodeType.Text,
      text: 'Hello, world!',
    });

    expect(text('foo bar')).toStrictEqual({
      type: NodeType.Text,
      text: 'foo bar',
    });
  });

  it('validates the args', () => {
    // @ts-expect-error - Invalid args.
    expect(() => text({ type: NodeType.Divider })).toThrow(
      'Invalid text component: At path: type -- Expected the literal `"text"`, but received: "divider".',
    );

    // @ts-expect-error - Invalid args.
    expect(() => text({})).toThrow(
      'Invalid text component: At path: text -- Expected a string, but received: undefined.',
    );
  });
});
