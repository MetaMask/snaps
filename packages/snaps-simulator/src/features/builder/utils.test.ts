import type { Component } from '@metamask/snaps-ui';
import { panel, text } from '@metamask/snaps-ui';
import type { NodeModel } from '@minoru/react-dnd-treeview';

import { panelToCode, nodeModelsToComponent } from './utils';

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
      "import { panel, text } from '@metamask/snaps-ui';

      const component = panel([text('foo'), panel([text('bar'), text('baz')])]);
      "
    `);
  });
});
