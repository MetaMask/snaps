import { NodeType } from '@metamask/snaps-sdk';
import type {
  Button,
  Component,
  Form,
  Input,
  Panel,
} from '@metamask/snaps-sdk';
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
 * Verify that the node is a valid form children.
 *
 * @param node - The node to verify.
 * @returns True if the node is a valid form children, otherwise false.
 */
export function isValidFormNode(node: Component) {
  return node.type === 'input' || node.type === 'button';
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
      switch (parent.data?.type) {
        case 'panel':
          parent.data.children.push(nodeModel.data);
          break;
        case 'form': {
          if (isValidFormNode(nodeModel.data)) {
            parent.data.children.push(nodeModel.data as Input | Button);
          }
          break;
        }

        default:
          throw new Error('Parent must be a panel or form.');
      }
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
function getComponentTypes(component: Panel | Form): NodeType[] {
  const componentTypes = new Set<NodeType>();
  componentTypes.add(component.type);

  for (const child of component.children) {
    componentTypes.add(child.type);

    if (child.type === 'panel' || child.type === 'form') {
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
    case NodeType.Form:
      return `'${component.name}', ${component.children
        .map(getComponentArgs)
        .join(',\n')}`;
    case NodeType.Copyable:
      return `'${component.value}'${component.sensitive ? ', true' : ''}`;
    case NodeType.Text:
    case NodeType.Heading:
    case NodeType.Image:
      return JSON.stringify(component.value);
    case NodeType.Button:
    case NodeType.Input: {
      const args = Object.keys(component)
        .filter(
          (key) =>
            key !== 'type' && component[key as keyof typeof component] !== '',
        )
        .reduce((acc, prev) => {
          return { ...acc, [prev]: component[prev as keyof typeof component] };
        }, {});

      return JSON.stringify(args);
    }
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

  if (component.type === NodeType.Form) {
    return `form('${component.name}', [\n${component.children
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
      import { ${types} } from '@metamask/snaps-sdk';

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
