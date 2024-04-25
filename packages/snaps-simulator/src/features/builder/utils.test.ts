import type { Component } from '@metamask/snaps-sdk';
import { button, form, input, panel, text } from '@metamask/snaps-sdk';
import type { NodeModel } from '@minoru/react-dnd-treeview';

import {
  isValidFormNode,
  panelToCode,
  nodeModelsToComponent,
  getNodeText,
} from './utils';

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
      {
        id: 4,
        parent: 1,
        text: 'child',
        data: form('form', []),
      },
      {
        id: 5,
        parent: 4,
        text: 'child',
        data: input('input'),
      },
    ];

    const component = nodeModelsToComponent(nodeModels);
    expect(component).toStrictEqual(
      panel([panel([text('foo')]), form('form', [input('input')])]),
    );
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

  it('creates code from a component with a form', () => {
    const component: Component = panel([
      text('foo'),
      form('form', [input('input'), button('button')]),
    ]);

    const code = panelToCode(component);
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

describe('getNodeText', () => {
  it('returns the text of a node model', () => {
    const nodeModel: NodeModel<Component> = {
      id: 1,
      parent: 0,
      text: 'foo',
      data: text('bar'),
    };

    const nodeText = getNodeText(nodeModel);
    expect(nodeText).toBe('bar');
  });

  it('returns null if the node model does not have text', () => {
    const nodeModel: NodeModel<Component> = {
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
