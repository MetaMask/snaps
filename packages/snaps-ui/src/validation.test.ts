import {
  Divider,
  Heading,
  NodeType,
  Panel,
  Spacer,
  Spinner,
  Text,
} from './nodes';
import { isComponent } from './validation';

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
      text: 'Hello, world!',
    };

    expect(isComponent(heading)).toBe(true);
  });

  it('returns true for a panel component', () => {
    const panel: Panel = {
      type: NodeType.Panel,
      children: [
        {
          type: NodeType.Heading,
          text: 'Hello, world!',
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
              text: 'Hello, world!',
            },
          ],
        },
      ],
    };

    expect(isComponent(panel)).toBe(true);
  });

  it('returns true for a spacer component', () => {
    const spacer: Spacer = {
      type: NodeType.Spacer,
    };

    expect(isComponent(spacer)).toBe(true);
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
      text: 'Hello, world!',
    };

    expect(isComponent(text)).toBe(true);
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
