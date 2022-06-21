import { parse } from '@babel/parser';
import traverse, { Node } from '@babel/traverse';
import generate from '@babel/generator';
import template from '@babel/template';

const COMMENTS_KEYS = [
  'innerComments',
  'leadingComments',
  'trailingComments',
] as const;

/**
 * Get the abstract syntax tree (AST) representation of the given code. This
 * uses Babel's parser to generate the AST.
 *
 * @param code - The code to parse.
 * @returns The AST representation of the code.
 * @throws If the code contains syntax errors.
 */
export function getAST(code: string): Node {
  const ast = parse(code);

  if (ast.errors?.length > 0) {
    throw new Error(
      `Failed to parse the provided code to an AST: ${ast.errors.join('\n')}`,
    );
  }

  return ast as Node;
}

/**
 * Turn Babel's abstract syntax tree (AST) representation back into a string.
 *
 * @param ast - The AST to generate code from.
 * @returns The generated code.
 */
export function getCode(ast: Node): string {
  return generate(ast).code;
}

export type PostProcessOptions = {
  stripComments: boolean;
  transformHtmlComments: boolean;
};

const evalWrapper = template.smart(`
  (1, REF)(ARGS)
`);

const objectEvalWrapper = template.smart(`
  (1, OBJECT.REF)
`);

const regeneratorRuntimeWrapper = template.smart(`
  var regeneratorRuntime;
`);

/**
 * Post process code with AST.
 *
 * @param ast - The AST to post process.
 * @param options - The post-process options.
 * @param options.stripComments - Whether to strip comments. Defaults to `true`.
 * @returns The modified AST.
 */
export function postProcessAST(
  ast: Node,
  { stripComments = true }: Partial<PostProcessOptions> = {},
): Node {
  traverse(ast, {
    enter(path) {
      const { node } = path;

      // Strip comments if enabled
      if (stripComments) {
        // Sets the comment value to `null` if defined. Simply setting the keys
        // to null results in a bunch of unnecessary keys being added to each
        // node.
        COMMENTS_KEYS.forEach((key) => {
          if (node[key]) {
            node[key] = null;
          }
        });
      }
    },

    FunctionExpression(path) {
      const { node } = path;

      // Browserify provides the `Buffer` global as an argument to modules that
      // use it, but this does not work in SES. Since we pass in `Buffer` as an
      // endowment, we can simply remove the argument.
      //
      // Note that this only removes `Buffer` from a wrapped function
      // expression, e.g., `(function (Buffer) { ... })`. Regular functions
      // are not affected.
      //
      // TODO: Since we're working on the AST level, we could check the scope
      // of the function expression, and possibly prevent false positives?
      if (node.type === 'FunctionExpression' && node.extra?.parenthesized) {
        node.params = node.params.filter(
          (param) => !(param.type === 'Identifier' && param.name === 'Buffer'),
        );
      }
    },

    CallExpression(path) {
      const { node } = path;

      // Replace `eval(foo)` with `(1, eval)(foo)`.
      if (node.callee.type === 'Identifier' && node.callee.name === 'eval') {
        path.replaceWith(
          evalWrapper({
            REF: node.callee,
            ARGS: node.arguments,
          }) as any,
        );

        // Need to skip the path here, to prevent the node from being visited
        // again.
        path.skip();
      }
    },

    MemberExpression(path) {
      const { node } = path;

      // Replace `object.eval(foo)` with `(1, object.eval)(foo)`.
      if (
        node.property.type === 'Identifier' &&
        node.property.name === 'eval'
      ) {
        path.replaceWith(
          objectEvalWrapper({
            OBJECT: node.object,
            REF: node.property,
          }) as any,
        );

        // Need to skip the path here, to prevent the node from being visited
        // again.
        path.skip();
      }
    },

    Identifier(path) {
      const { node } = path;

      // Insert `regeneratorRuntime` global if it's used in the code.
      if (node.name === 'regeneratorRuntime') {
        path.insertBefore(regeneratorRuntimeWrapper());
        path.stop();
      }
    },
  });

  return ast;
}
