import type { Component } from '@metamask/snaps-sdk';
import { button, input, panel, text } from '@metamask/snaps-sdk';
import type { NodeModel } from '@minoru/react-dnd-treeview';

import { isValidFormNode, panelToCode, nodeModelsToComponent } from './utils';

describe('nodeModelsToComponent', () => {
  it('creates a component from an array of node models', () => {
    const nodeModels: NodeModel<Component>[] = [
      {
        id: 1,
        parent: 0,
        text: 'parent',
        data: panel([]),
      },
      {
        id: 2,
        parent: 1,
        text: 'child',
        data: panel([]),
      },
      {
        id: 3,
        parent: 2,
        text: 'child',
        data: text('foo'),
      },
    ];

    const component = nodeModelsToComponent(nodeModels);
    expect(component).toStrictEqual(panel([panel([text('foo')])]));
  });
});

describe('paneltoCode', () => {
  it('creates code from a component', () => {
    const component: Component = panel([
      text('foo'),
      panel([text('bar'), text('baz')]),
    ]);

    const code = panelToCode(component);
    expect(code).toMatchInlineSnapshot(`
      "import { panel, text } from '@metamask/snaps-sdk';

      const component = panel([text('foo'), panel([text('bar'), text('baz')])]);
      "
    `);
  });
});

describe('isValidFormNode', () => {
  it('returns true for input nodes', () => {
    const node: Component = input('input');

    expect(isValidFormNode(node)).toBe(true);
  });

  it('returns true for button nodes', () => {
    const node: Component = button('button');

    expect(isValidFormNode(node)).toBe(true);
  });

  it('returns false for other nodes', () => {
    const node: Component = text('foo');

    expect(isValidFormNode(node)).toBe(false);
  });
});
