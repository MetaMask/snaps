import type {
  BoxElement,
  ButtonElement,
  FormElement,
  GenericSnapElement,
  InputElement,
  JSXElement,
} from '@metamask/snaps-sdk/jsx-runtime';
import { deepClone, getJsxChildren } from '@metamask/snaps-utils';
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
export function getNodeText(nodeModel: NodeModel<JSXElement>) {
  assert(nodeModel.data, 'Node model must have data.');

  if (hasProperty(nodeModel.data.props, 'value')) {
    return nodeModel.data.props.value as string;
  }

  if (hasProperty(nodeModel.data.props, 'children')) {
    return nodeModel.data.props.children as string;
  }

  return null;
}

/**
 * Verify that the node is a valid form children.
 *
 * @param node - The node to verify.
 * @returns True if the node is a valid form children, otherwise false.
 */
export function isValidFormNode(node: JSXElement) {
  return node.type === 'Input' || node.type === 'Button';
}

/**
 * Convert an array of node models to a component. This is useful for converting
 * the tree view data to a component that can be rendered.
 *
 * @param nodeModels - The array of node models.
 * @returns The component.
 */
export function nodeModelsToComponent(
  nodeModels: NodeModel<JSXElement>[],
): BoxElement {
  // We want to clone the node models so that we don't mutate the original data.
  const clonedModels = deepClone(nodeModels);

  for (const nodeModel of clonedModels) {
    assert(nodeModel.data, 'Node model must have data.');
    const parent = clonedModels.find((model) => model.id === nodeModel.parent);
    console.log(nodeModel);
    if (parent) {
      switch (parent.data?.type) {
        case 'Box':
          (parent.data.props.children as GenericSnapElement[]).push(
            nodeModel.data,
          );
          break;
        case 'Form': {
          if (isValidFormNode(nodeModel.data)) {
            (parent.data.props.children as GenericSnapElement[]).push(
              nodeModel.data as InputElement | ButtonElement,
            );
          }
          break;
        }

        default:
          throw new Error('Parent must be a panel or form.');
      }
    }
  }

  const root = clonedModels.find((model) => model.parent === 0);

  console.log(root?.data?.type);
  assert(root?.data?.type === 'Box', 'Root must be a panel.');

  return root.data;
}

/**
 * Get all the component types used in a component.
 *
 * @param component - The component.
 * @returns The component types.
 */
function getComponentTypes(component: BoxElement | FormElement): string[] {
  const componentTypes = new Set<string>();
  componentTypes.add(component.type);

  const children = getJsxChildren(component);

  for (const child of children) {
    if (typeof child !== 'string') {
      componentTypes.add(child.type);

      if (child.type === 'Box' || child.type === 'Form') {
        const childComponentTypes = getComponentTypes(child);
        for (const childComponentType of childComponentTypes) {
          componentTypes.add(childComponentType);
        }
      }
    }
  }

  return Array.from(componentTypes).sort((a, b) => a.localeCompare(b));
}

/**
 * Convert an element to code.
 *
 * @param element - The element.
 * @returns The element as code.
 */
function elementToCode(element: JSXElement): string {
  return `<${element.type} ${getElementProps(element.props)}>${
    hasProperty(element.props, 'children')
      ? `${getElementChildren(getJsxChildren(element))} </${element.type}`
      : ''
  }`;
}

/**
 * Get the props of an element as code.
 *
 * @param props - The props.
 * @returns The props to code.
 */
function getElementProps(props: Record<string, unknown>) {
  return Object.entries(props)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}="${value}"`;
      }

      return `${key}={${JSON.stringify(value)}}`;
    })
    .join(' ');
}

/**
 * Get the children of an element as code.
 *
 * @param children - The children.
 * @returns The children to code.
 */
function getElementChildren(children: (string | JSXElement)[]) {
  return children
    .map((child) => {
      if (typeof child === 'string') {
        return child;
      }

      return elementToCode(child);
    })
    .join(' ');
}

/**
 * Convert a root Box to code. The code is formatted using prettier.
 *
 * @param component - The root panel.
 * @returns The code.
 */
export function boxToCode(component: BoxElement): string {
  const types = getComponentTypes(component).join(', ');

  return prettier.format(
    `
      import { ${types} } from '@metamask/snaps-sdk';

      const component = ${elementToCode(component)};
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
