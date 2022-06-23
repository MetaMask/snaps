import { parse } from '@babel/parser';
import traverse, { Node } from '@babel/traverse';
import generate from '@babel/generator';
import template from '@babel/template';
import {
  binaryExpression,
  Expression,
  Identifier,
  stringLiteral,
  templateElement,
  templateLiteral,
} from '@babel/types';

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
 * @param attachComment - Whether to attach comments to the AST.
 * @returns The AST representation of the code.
 * @throws If the code contains syntax errors.
 */
export function getAST(code: string, attachComment = true): Node {
  const ast = parse(code, {
    // We set `errorRecovery` to `true` because Babel otherwise immediately
    // throws if it fails to parse the code. This way we can handle the error by
    // looking at `ast.errors`.
    errorRecovery: true,

    // This apparently changes how Babel processes HTML terminators, parsing
    // `<!--` as `< ! --` instead, which is what we want.
    sourceType: 'unambiguous',

    // Strict mode isn't enabled by default, so we need to enable it here.
    strictMode: true,

    // If this is disabled, the AST does not include any comments. This is
    // useful for performance reasons, and we use it for stripping comments.
    attachComment,
  });

  if (ast.errors?.length > 0) {
    throw new Error(
      `Failed to parse the provided code to an AST:\n${ast.errors.join('\n')}`,
    );
  }

  return ast as Node;
}

/**
 * Turn Babel's abstract syntax tree (AST) representation back into a string.
 *
 * @param ast - The AST to generate code from.
 * @param code - The original code, used for source maps.
 * @returns The generated code.
 */
export function getCode(ast: Node, code?: string): string {
  return generate(ast, {}, code).code;
}

const evalWrapper = template.smart(`
  (1, REF)(ARGS)
`);

const objectEvalWrapper = template.smart(`
  (1, OBJECT.REF)
`);

const regeneratorRuntimeWrapper = template.statement(`
  var regeneratorRuntime;
`);

/**
 * Breaks up tokens that would otherwise result in SES errors. The tokens are
 * broken up in a non-destructive way where possible. Currently works with:
 * - HTML comment tags `<!--` and `-->`, broken up into `<!`, `--`, and `--`,
 * `>`.
 * - `import(n)` statements, broken up into `import`, `(n)`.
 *
 * @param value - The string value to break up.
 * @returns The string split into an array, in a way that it can be joined
 * together to form the same string, but with the tokens separated into single
 * array elements.
 */
function breakTokens(value: string): string[] {
  // The RegEx below consists of multiple groups joined by a boolean OR.
  // Each part consists of two groups which capture a part of each string
  // which needs to be split up, e.g., `<!--` is split into `<!` and `--`.
  const tokens = value.split(/(<!)(--)|(--)(>)|(import)(\(.*?\))/gu);

  return (
    tokens
      // TODO: The `split` above results in some values being `undefined`.
      // There may be a better solution to avoid having to filter those out.
      .filter((token) => token !== '' && token !== undefined)
  );
}

/**
 * Post process code with AST such that it can be evaluated in SES.
 *
 * Currently:
 * - Makes all direct calls to eval indirect.
 * - Handles certain Babel-related edge cases.
 * - Removes the `Buffer` provided by Browserify.
 * - Optionally removes comments.
 * - Breaks up tokens that would otherwise result in SES errors, such as HTML
 * comment tags `<!--` and `-->` and `import(n)` statements.
 *
 * @param ast - The AST to post process.
 * @returns The modified AST.
 */
export function postProcessAST(ast: Node): Node {
  // Modifies the AST in place.
  traverse(ast, {
    enter(path) {
      const { node } = path;

      COMMENTS_KEYS.forEach((key) => {
        const comments = node[key];
        if (!comments) {
          return;
        }

        // Break up tokens that could be parsed as HTML comment terminators. The
        // regular expressions below are written strangely so as to avoid the
        // appearance of such tokens in our source code. For reference:
        // https://github.com/endojs/endo/blob/70cc86eb400655e922413b99c38818d7b2e79da0/packages/ses/error-codes/SES_HTML_COMMENT_REJECTED.md
        comments.forEach((comment) => {
          comment.value = comment.value
            .replace(new RegExp(`<!${'--'}`, 'gu'), '< !--')
            .replace(new RegExp(`${'--'}>`, 'gu'), '-- >')
            .replace(/import(\(.*\))/gu, 'import\\$1');
        });
      });
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
          }) as Node,
        );
      }
    },

    MemberExpression(path) {
      const { node } = path;

      // Replace `object.eval(foo)` with `(1, object.eval)(foo)`.
      if (
        node.property.type === 'Identifier' &&
        node.property.name === 'eval' &&
        // If the expression is already wrapped we can ignore it
        path.parent.type !== 'SequenceExpression'
      ) {
        path.replaceWith(
          objectEvalWrapper({
            OBJECT: node.object,
            REF: node.property,
          }) as any,
        );
      }
    },

    Identifier(path) {
      const { node } = path;

      // Insert `regeneratorRuntime` global if it's used in the code.
      if (node.name === 'regeneratorRuntime') {
        const program = path.findParent(
          (parent) => parent.node.type === 'Program',
        );

        // We know that `program` is a Program node here, but this keeps
        // TypeScript happy.
        if (program?.node.type === 'Program') {
          const body = program.node.body[0];

          // This stops it from inserting `regeneratorRuntime` multiple times.
          if (
            body.type === 'VariableDeclaration' &&
            (body.declarations[0].id as Identifier).name ===
              'regeneratorRuntime'
          ) {
            return;
          }

          program?.node.body.unshift(regeneratorRuntimeWrapper());
        }
      }
    },

    TemplateLiteral(path) {
      const { node } = path;

      // This checks if the template literal was visited before. Without this,
      // it would cause an infinite loop resulting in a stack overflow. We can't
      // skip the path here, because we need to visit the children of the node.
      if (path.getData('visited')) {
        return;
      }

      // Break up tokens that could be parsed as HTML comment terminators, or
      // `import()` statements.
      // For reference:
      // - https://github.com/endojs/endo/blob/70cc86eb400655e922413b99c38818d7b2e79da0/packages/ses/error-codes/SES_HTML_COMMENT_REJECTED.md
      // - https://github.com/MetaMask/snaps-skunkworks/issues/505
      const expressions = node.quasis.reduce<Expression[]>(
        (acc, quasi, index) => {
          // Note: Template literals have two variants, "cooked" and "raw". Here
          // we use the cooked version.
          // https://exploringjs.com/impatient-js/ch_template-literals.html#template-strings-cooked-vs-raw
          const replacement = breakTokens(quasi.value.cooked as string).map(
            (token) => stringLiteral(token),
          );

          if (node.expressions[index]) {
            return [
              ...acc,
              ...replacement,
              node.expressions[index],
            ] as Expression[];
          }

          return [...acc, ...replacement];
        },
        [],
      );

      // Only update the node if something changed.
      if (expressions.length <= node.quasis.length) {
        return;
      }

      path.replaceWith(
        templateLiteral(
          new Array(expressions.length + 1)
            .fill(undefined)
            .map(() => templateElement({ cooked: '', raw: '' })),
          expressions,
        ) as Node,
      );

      path.setData('visited', true);
    },

    StringLiteral(path) {
      const { node } = path;

      // Break up tokens that could be parsed as HTML comment terminators, or
      // `import()` statements.
      // For reference:
      // - https://github.com/endojs/endo/blob/70cc86eb400655e922413b99c38818d7b2e79da0/packages/ses/error-codes/SES_HTML_COMMENT_REJECTED.md
      // - https://github.com/MetaMask/snaps-skunkworks/issues/505
      const tokens = breakTokens(node.value);

      // Only update the node if the string literal was broken up.
      if (tokens.length <= 1) {
        return;
      }

      const replacement = tokens
        .slice(1)
        .reduce<Expression>(
          (acc, value) => binaryExpression('+', acc, stringLiteral(value)),
          stringLiteral(tokens[0]),
        );

      path.replaceWith(replacement as Node);
      path.skip();
    },
  });

  return ast;
}
