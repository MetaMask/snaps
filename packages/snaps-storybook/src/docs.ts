import generate from '@babel/generator';
import { parse } from '@babel/parser';
import type { NodePath } from '@babel/traverse';
import traverse from '@babel/traverse';
import type {
  Expression,
  JSXAttribute,
  JSXElement,
  Node,
  ObjectProperty,
} from '@babel/types';
import {
  isJSXElement,
  jsxClosingElement,
  isJSXOpeningElement,
  isArrayExpression,
  jsxText,
  isExpression,
  isStringLiteral,
  jsxExpressionContainer,
  isObjectProperty,
  isIdentifier,
  isObjectExpression,
  isArrowFunctionExpression,
  isFunctionExpression,
  jsxAttribute,
  jsxIdentifier,
} from '@babel/types';
import parser from 'prettier/parser-babel';
import { format } from 'prettier/standalone';

/**
 * Find a node in the AST.
 *
 * @param ast - The AST to search.
 * @param condition - The condition to match.
 * @returns The node if found.
 * @template Type - The type of node to find. This can be inferred from the
 * condition.
 * @example
 * const property = find(ast, (path): path is NodePath<ObjectProperty> => {
 *   return (
 *     isObjectProperty(path.node) &&
 *     isIdentifier(path.node.key, { name: 'render' })
 *   );
 * });
 */
function find<Type extends Node>(
  ast: Node,
  condition: (path: NodePath) => path is NodePath<Type>,
) {
  let result: Type | undefined;

  traverse(ast, {
    enter(path) {
      if (condition(path)) {
        path.stop();
        result = path.node;

        return null;
      }

      return null;
    },
  });

  return result;
}

/**
 * Get the render function from an object expression.
 *
 * @param ast - The AST to search.
 * @returns The render function.
 */
function getRenderFunction(ast: Node) {
  const property = find(ast, (path): path is NodePath<ObjectProperty> => {
    return (
      isObjectProperty(path.node) &&
      isIdentifier(path.node.key, { name: 'render' })
    );
  });

  if (
    property &&
    (isFunctionExpression(property.value) ||
      isArrowFunctionExpression(property.value))
  ) {
    return property.value;
  }

  return null;
}

type Args = Record<PropertyKey, Expression>;

/**
 * Get the args object from an object expression.
 *
 * @param ast - The AST to search.
 * @returns The args object.
 */
function getArgsObject(ast: Node): Args | null {
  const args = find(ast, (path): path is NodePath<ObjectProperty> => {
    return (
      isObjectProperty(path.node) &&
      isIdentifier(path.node.key, { name: 'args' })
    );
  });

  if (args && isObjectExpression(args.value)) {
    return args.value.properties
      .filter((property): property is ObjectProperty =>
        isObjectProperty(property),
      )
      .reduce((accumulator, property) => {
        if (!isIdentifier(property.key) || !isExpression(property.value)) {
          return accumulator;
        }

        return {
          ...accumulator,
          [property.key.name]: property.value,
        };
      }, {});
  }

  return null;
}

/**
 * Get a JSX attribute (i.e., `key={value}`) from a name and expression. String
 * literals are returned as is, while other expressions are wrapped in an
 * expression container (`{}`).
 *
 * @param name - The name of the attribute.
 * @param expression - The expression to use as the value.
 * @returns The JSX attribute.
 */
function getJsxAttribute(
  name: PropertyKey,
  expression: Expression,
): JSXAttribute | null {
  const identifier = jsxIdentifier(name.toString());
  if (isStringLiteral(expression)) {
    return jsxAttribute(identifier, expression);
  }

  return jsxAttribute(identifier, jsxExpressionContainer(expression));
}

/**
 * Get all children from an expression.
 *
 * @param children - The children expression.
 * @returns The children as JSX elements.
 */
function getChildren(children: Expression): JSXElement['children'] {
  if (isArrayExpression(children)) {
    return children.elements
      .filter((element): element is Expression => isExpression(element))
      .flatMap(getChildren);
  }

  if (isStringLiteral(children)) {
    return [jsxText(children.value)];
  }

  if (isJSXElement(children)) {
    return [children];
  }

  return [jsxExpressionContainer(children)];
}

/**
 * Get the source code for a Storybook story. This assumes the story is an
 * object with a render function and args object. Story functions are not
 * supported at this time.
 *
 * @param code - The code to transform.
 * @returns The transformed code.
 * @example
 * const code = `
 * {
 *   render: props => <Foo {...props} />,
 *   args: {
 *     bar: 'baz',
 *     children: <Qux />,
 *   },
 * }
 * `;
 *
 * getSourceCode(code); // "<Foo bar='baz'><Qux /></Foo>"
 */
export function getSourceCode(code: string) {
  const ast = parse(`(${code})`, {
    plugins: ['jsx'],
  });

  const render = getRenderFunction(ast);
  const name = isIdentifier(render?.params[0])
    ? render?.params[0].name
    : 'props';

  const args = getArgsObject(ast);

  // If the render function or args object are not found, return the original
  // code.
  if (!render || !args) {
    return code;
  }

  let currentElement: JSXElement | null = null;

  // Create the JSX element from the render function and args object.
  traverse(ast, {
    JSXElement(path) {
      currentElement = path.node;
    },

    JSXSpreadAttribute(path) {
      if (
        isIdentifier(path.node.argument) &&
        path.node.argument.name === name
      ) {
        path.replaceWithMultiple(
          Object.entries(args)
            .filter(([key]) => key !== 'children')
            .map(([key, value]) => getJsxAttribute(key, value))
            .filter((value): value is JSXAttribute => value !== null),
        );
      }

      if (args.children && currentElement) {
        if (isJSXOpeningElement(path.parent)) {
          path.parent.selfClosing = false;
          currentElement.closingElement = jsxClosingElement(path.parent.name);
        }

        currentElement.children = getChildren(args.children);
      }
    },
  });

  // If we don't add a leading semicolon, Prettier will add one itself. Instead,
  // we add a leading semicolon and remove it after formatting.
  const output = `;${generate(render.body).code}`;
  return format(output, {
    parser: 'babel',
    plugins: [parser],
    singleQuote: true,
    jsxSingleQuote: false,
    semi: false,
  }).slice(1);
}
