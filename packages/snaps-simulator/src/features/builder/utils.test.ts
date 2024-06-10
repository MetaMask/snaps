import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import {
  Box,
  Text,
  Form,
  Input,
  Field,
  Button,
  Copyable,
} from '@metamask/snaps-sdk/jsx';
import type { NodeModel } from '@minoru/react-dnd-treeview';

import {
  isValidFormNode,
  boxToCode,
  nodeModelsToComponent,
  getNodeText,
} from './utils';

describe('nodeModelsToComponent', () => {
  it('creates a component from an array of node models', () => {
    const nodeModels: NodeModel<JSXElement>[] = [
      {
        id: 1,
        parent: 0,
        text: 'parent',
        // @ts-expect-error - Invalid Box children prop.
        data: Box({ children: [] }),
      },
      {
        id: 2,
        parent: 1,
        text: 'child',
        // @ts-expect-error - Invalid Box children prop.
        data: Box({ children: [] }),
      },
      {
        id: 3,
        parent: 2,
        text: 'child',
        data: Text({ children: 'foo' }),
      },
      {
        id: 4,
        parent: 1,
        text: 'child',
        // @ts-expect-error - Invalid Form children prop.
        data: Form({ name: 'form', children: [] }),
      },
      {
        id: 5,
        parent: 4,
        text: 'child',
        // @ts-expect-error - Invalid Field children prop.
        data: Field({ children: [] }),
      },
      {
        id: 6,
        parent: 5,
        text: 'child',
        data: Input({ name: 'input' }),
      },
    ];

    const component = nodeModelsToComponent(nodeModels);
    expect(component).toStrictEqual(
      Box({
        children: [
          Box({ children: [Text({ children: 'foo' })] }),
          Form({
            name: 'form',
            children: [Field({ children: Input({ name: 'input' }) })],
          }),
        ],
      }),
    );
  });
});

describe('boxToCode', () => {
  it('creates code from a component', () => {
    const component = Box({
      children: [
        Text({ children: 'foo' }),
        Box({
          children: [Text({ children: 'bar' }), Text({ children: 'baz' })],
        }),
      ],
    });

    const code = boxToCode(component);
    expect(code).toMatchInlineSnapshot(`
      "import { panel, text } from '@metamask/snaps-sdk';

      const component = panel([text('foo'), panel([text('bar'), text('baz')])]);
      "
    `);
  });

  it('creates code from a component with a form', () => {
    const component = Box({
      children: [
        Text({ children: 'foo' }),
        Form({
          name: 'form',
          children: [
            Field({
              children: [
                Input({ name: 'input' }),
                Button({ children: 'button' }),
              ],
            }),
          ],
        }),
      ],
    });

    const code = boxToCode(component);
    expect(code).toMatchInlineSnapshot(`
      "import { button, form, input, panel, text } from '@metamask/snaps-sdk';

      const component = panel([
        text('foo'),
        form('form', [input({ name: 'input' }), button({ value: 'button' })]),
      ]);
      "
    `);
  });
});

describe('isValidFormNode', () => {
  it('returns true for input nodes', () => {
    const node = Input({ name: 'input' });

    expect(isValidFormNode(node)).toBe(true);
  });

  it('returns true for button nodes', () => {
    const node = Button({ children: 'button' });

    expect(isValidFormNode(node)).toBe(true);
  });

  it('returns false for other nodes', () => {
    const node = Text({ children: 'foo' });

    expect(isValidFormNode(node)).toBe(false);
  });
});

describe('getNodeText', () => {
  it('returns the children of a node model', () => {
    const nodeModel: NodeModel<JSXElement> = {
      id: 1,
      parent: 0,
      text: 'foo',
      data: Text({ children: 'bar' }),
    };

    const nodeText = getNodeText(nodeModel);
    expect(nodeText).toBe('bar');
  });

  it('returns the value of a node model', () => {
    const nodeModel: NodeModel<JSXElement> = {
      id: 1,
      parent: 0,
      text: 'foo',
      data: Copyable({ value: 'bar' }),
    };

    const nodeText = getNodeText(nodeModel);
    expect(nodeText).toBe('bar');
  });

  it('returns null if the node model does not have text', () => {
    const nodeModel: NodeModel<JSXElement> = {
      id: 1,
      parent: 0,
      text: 'foo',
      // @ts-expect-error invalid data.
      data: {},
    };

    const nodeText = getNodeText(nodeModel);
    expect(nodeText).toBeNull();
  });
});
