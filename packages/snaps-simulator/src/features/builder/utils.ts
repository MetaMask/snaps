import type {
  BoxElement,
  ButtonElement,
  FieldElement,
  InputElement,
  JSXElement,
} from '@metamask/snaps-sdk/jsx';
import { deepClone, getJsxChildren, hasChildren } from '@metamask/snaps-utils';
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
  return node.type === 'Field' || node.type === 'Button';
}

/**
 * Verify that the node is a valid field children.
 *
 * @param node - The node to verify.
 * @param field - The field element.
 * @returns True if the node is a valid field children, otherwise false.
 */
export function isValidFieldNode(
  node: JSXElement,
  field: FieldElement,
): node is InputElement | ButtonElement {
  const fieldChildren = getJsxChildren(field);

  if (
    (fieldChildren as JSXElement[]).some(
      (child) =>
        (child.type === 'Button' && node.type === 'Button') ||
        (child.type === 'Input' && node.type === 'Input'),
    )
  ) {
    return false;
  }

  return node.type === 'Input' || node.type === 'Button';
}

/**
 * Set the children of an element.
 *
 * @param parent - The parent element.
 * @param child - The child element.
 * @param validator - A function to validate the child element.
 * @returns The children of the parent element.
 */
export function setElementChildren(
  parent: JSXElement,
  child: JSXElement,
  validator?: (node: JSXElement, parent: JSXElement) => boolean,
) {
  const children = getJsxChildren(parent) as JSXElement[];

  if (validator && !validator(child, parent)) {
    return children;
  }

  children.push(child);

  return children;
}

/**
 * Set the children of a field element.
 *
 * @param element - The field element.
 * @param child - The child element.
 * @returns The children of the field element.
 */
export function setFieldChildren(element: FieldElement, child: JSXElement) {
  const children = getJsxChildren(element) as [InputElement, ButtonElement];

  if (!isValidFieldNode(child, element)) {
    return children;
  }

  if (children.length > 0) {
    children.push(child);

    return children;
  }

  return child as InputElement;
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
    if (parent) {
      switch (parent.data?.type) {
        case 'Box':
          parent.data.props.children = setElementChildren(
            parent.data,
            nodeModel.data,
          );

          break;
        case 'Form':
          parent.data.props.children = setElementChildren(
            parent.data,
            nodeModel.data,
            isValidFormNode,
          ) as (FieldElement | ButtonElement)[];
          break;

        case 'Field':
          parent.data.props.children = setFieldChildren(
            parent.data,
            nodeModel.data,
          );
          break;

        default:
          throw new Error('Parent must be a panel or form.');
      }
    }
  }

  const root = clonedModels.find((model) => model.parent === 0);

  assert(root?.data?.type === 'Box', 'Root must be a panel.');

  return root.data;
}

/**
 * Get all the component types used in a component.
 *
 * @param component - The component.
 * @returns The component types.
 */
function getComponentTypes(component: JSXElement): string[] {
  const componentTypes = new Set<string>();
  componentTypes.add(component.type);

  const children = getJsxChildren(component);

  for (const child of children) {
    if (typeof child !== 'string') {
      componentTypes.add(child.type);

      if (hasChildren(component)) {
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
  const children = getJsxChildren(element);

  if (children.length === 0) {
    return `<${element.type}${getElementProps(element.props)} />`;
  }

  return `<${element.type}${getElementProps(
    element.props,
  )}>${`${getElementChildren(getJsxChildren(element))}</${element.type}>`}`;
}

/**
 * Get the props of an element as code.
 *
 * @param props - The props.
 * @returns The props to code.
 */
function getElementProps(props: Record<string, unknown>) {
  const string = Object.entries(props)
    .filter(([key, _]) => key !== 'children')
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}="${value}"`;
      }

      return `${key}={${JSON.stringify(value)}}`;
    });

  return string.length > 0 ? ` ${string.join(' ')}` : '';
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
    .join('\n');
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

      const Component = () => (${elementToCode(component)});
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

/**
 * Verify that an element can be dropped into a parent element.
 *
 * @param parent - The parent element.
 * @param element - The element to drop.
 * @returns True if the element can be dropped, otherwise false.
 */
export function canDropElement(parent?: JSXElement, element?: JSXElement) {
  if (!parent || !element) {
    return false;
  }

  switch (parent.type) {
    case 'Box':
      return true;
    case 'Form':
      return isValidFormNode(element);
    case 'Field':
      return isValidFieldNode(element, parent as FieldElement);
    default:
      return false;
  }
}
