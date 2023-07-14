import type { Component, Panel } from '@metamask/snaps-ui';
import { NodeType } from '@metamask/snaps-ui';
import { deepClone } from '@metamask/snaps-utils';
import { assert, hasProperty } from '@metamask/utils';
import type { NodeModel } from '@minoru/react-dnd-treeview';
import typescript from 'prettier/parser-typescript';
import prettier from 'prettier/standalone';

/**
 * Get the text of a node model.
 *
 * @param nodeModel - The node model.
 * @returns The text of the node model, or `null` if the node model does not
 * have text.
 */
export function getNodeText(nodeModel: NodeModel<Component>) {
  assert(nodeModel.data, 'Node model must have data.');

  if (hasProperty(nodeModel.data, 'value')) {
    return nodeModel.data.value as string;
  }

  return null;
}

/**
 * Convert an array of node models to a component. This is useful for converting
 * the tree view data to a component that can be rendered.
 *
 * @param nodeModels - The array of node models.
 * @returns The component.
 */
export function nodeModelsToComponent(
  nodeModels: NodeModel<Component>[],
): Panel {
  // We want to clone the node models so that we don't mutate the original data.
  const clonedModels = deepClone(nodeModels);

  for (const nodeModel of clonedModels) {
    assert(nodeModel.data, 'Node model must have data.');
    const parent = clonedModels.find((model) => model.id === nodeModel.parent);

    if (parent) {
      assert(parent.data?.type === 'panel', 'Parent must be a panel.');
      parent.data.children.push(nodeModel.data);
    }
  }

  const root = clonedModels.find((model) => model.parent === 0);
  assert(root?.data?.type === 'panel', 'Root must be a panel.');

  return root.data;
}

/**
 * Get all the component types used in a component.
 *
 * @param component - The component.
 * @returns The component types.
 */
function getComponentTypes(component: Panel): NodeType[] {
  const componentTypes = new Set<NodeType>();
  componentTypes.add(component.type);

  for (const child of component.children) {
    componentTypes.add(child.type);

    if (child.type === 'panel') {
      const childComponentTypes = getComponentTypes(child);
      for (const childComponentType of childComponentTypes) {
        componentTypes.add(childComponentType);
      }
    }
  }

  return Array.from(componentTypes).sort((a, b) => a.localeCompare(b));
}

/**
 * Get the arguments used to create a component.
 *
 * @param component - The component.
 * @returns The arguments.
 */
function getComponentArgs(component: Component): string {
  switch (component.type) {
    case NodeType.Panel:
      return component.children.map(getComponentArgs).join(',\n');
    case NodeType.Text:
    case NodeType.Heading:
    case NodeType.Copyable:
      return `'${component.value}'`;
    case NodeType.Spinner:
    case NodeType.Divider:
    default:
      return '';
  }
}

/**
 * Get the code for a component.
 *
 * @param component - The component.
 * @returns The code.
 */
function componentToCode(component: Component): string {
  if (component.type === NodeType.Panel) {
    return `panel([\n${component.children
      .map(componentToCode)
      .join(',\n')}\n])`;
  }

  const args = getComponentArgs(component);
  return `${component.type}(${args})`;
}

/**
 * Convert a root panel to code. The code is formatted using prettier.
 *
 * @param component - The root panel.
 * @returns The code.
 */
export function panelToCode(component: Panel): string {
  const types = getComponentTypes(component).join(', ');

  return prettier.format(
    `
      import { ${types} } from '@metamask/snaps-ui';

      const component = ${componentToCode(component)};
`,
    {
      parser: 'typescript',
      plugins: [typescript],
      printWidth: 80,
      tabWidth: 2,
      singleQuote: true,
      trailingComma: 'all',
    },
  );
}
