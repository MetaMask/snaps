// eslint-disable-next-line @typescript-eslint/no-shadow
import type { Node, Visitor, PluginObj } from '@babel/core';
import { transformSync, template } from '@babel/core';
import type { Expression, Identifier, TemplateElement } from '@babel/types';
import {
  binaryExpression,
  isUnaryExpression,
  isUpdateExpression,
  stringLiteral,
  templateElement,
  templateLiteral,
} from '@babel/types';

/**
 * Source map declaration taken from `@babel/core`. Babel doesn't export the
 * type for this, so it's copied from the source code instead here.
 */
export type SourceMap = {
  version: number;
  sources: string[];
  names: string[];
  sourceRoot?: string | undefined;
  sourcesContent?: string[] | undefined;
  mappings: string;
  file: string;
};

/**
 * The post process options.
 *
 * @property stripComments - Whether to strip comments. Defaults to `true`.
 * @property sourceMap - Whether to generate a source map for the modified code.
 * See also `inputSourceMap`.
 * @property inputSourceMap - The source map for the input code. When provided,
 * the source map will be used to generate a source map for the modified code.
 * This ensures that the source map is correct for the modified code, and still
 * points to the original source. If not provided, a new source map will be
 * generated instead.
 */
export type PostProcessOptions = {
  stripComments?: boolean;
  sourceMap?: boolean | 'inline';
  inputSourceMap?: SourceMap;
};

/**
 * The post processed bundle output.
 *
 * @property code - The modified code.
 * @property sourceMap - The source map for the modified code, if the source map
 * option was enabled.
 * @property warnings - Any warnings that occurred during the post-processing.
 */
export type PostProcessedBundle = {
  code: string;
  sourceMap?: SourceMap | null;
  warnings: PostProcessWarning[];
};

export enum PostProcessWarning {
  UnsafeMathRandom = '`Math.random` was detected in the bundle. This is not a secure source of randomness.',
}

// The RegEx below consists of multiple groups joined by a boolean OR.
// Each part consists of two groups which capture a part of each string
// which needs to be split up, e.g., `<!--` is split into `<!` and `--`.
const TOKEN_REGEX = /(<!)(--)|(--)(>)|(import)(\(.*?\))/gu;

// An empty template element, i.e., a part of a template literal without any
// value ("").
const EMPTY_TEMPLATE_ELEMENT = templateElement({ raw: '', cooked: '' });

const evalWrapper = template.statement(`
  (1, REF)(ARGS)
`);

const objectEvalWrapper = template.statement(`
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
  const tokens = value.split(TOKEN_REGEX);
  return (
    tokens
      // TODO: The `split` above results in some values being `undefined`.
      // There may be a better solution to avoid having to filter those out.
      .filter((token) => token !== '' && token !== undefined)
  );
}

/**
 * Breaks up tokens that would otherwise result in SES errors. The tokens are
 * broken up in a non-destructive way where possible. Currently works with:
 * - HTML comment tags `<!--` and `-->`, broken up into `<!`, `--`, and `--`,
 * `>`.
 * - `import(n)` statements, broken up into `import`, `(n)`.
 *
 * @param value - The string value to break up.
 * @returns The string split into a tuple consisting of the new template
 * elements and string literal expressions.
 */
function breakTokensTemplateLiteral(
  value: string,
): [TemplateElement[], Expression[]] {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore `matchAll` is not available in ES2017, but this code
  // should only be used in environments where the function is supported.
  const matches: RegExpMatchArray[] = Array.from(value.matchAll(TOKEN_REGEX));

  if (matches.length > 0) {
    const output = matches.reduce<[TemplateElement[], Expression[]]>(
      ([elements, expressions], rawMatch, index, values) => {
        const [, first, last] = rawMatch.filter((raw) => raw !== undefined);

        // Slice the text in front of the match, which does not need to be
        // broken up.
        const prefix = value.slice(
          index === 0
            ? 0
            : (values[index - 1].index as number) + values[index - 1][0].length,
          rawMatch.index,
        );

        return [
          [
            ...elements,
            templateElement({
              raw: getRawTemplateValue(prefix),
              cooked: prefix,
            }),
            EMPTY_TEMPLATE_ELEMENT,
          ],
          [...expressions, stringLiteral(first), stringLiteral(last)],
        ];
      },
      [[], []],
    );

    // Add the text after the last match to the output.
    const lastMatch = matches[matches.length - 1];
    const suffix = value.slice(
      (lastMatch.index as number) + lastMatch[0].length,
    );

    return [
      [
        ...output[0],
        templateElement({ raw: getRawTemplateValue(suffix), cooked: suffix }),
      ],
      output[1],
    ];
  }

  // If there are no matches, simply return the original value.
  return [
    [templateElement({ raw: getRawTemplateValue(value), cooked: value })],
    [],
  ];
}

/**
 * Get a raw template literal value from a cooked value. This adds a backslash
 * before every '`', '\' and '${' characters.
 *
 * @see https://github.com/babel/babel/issues/9242#issuecomment-532529613
 * @param value - The cooked string to get the raw string for.
 * @returns The value as raw value.
 */
function getRawTemplateValue(value: string) {
  return value.replace(/\\|`|\$\{/gu, '\\$&');
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
 * @param code - The code to post process.
 * @param options - The post-process options.
 * @param options.stripComments - Whether to strip comments. Defaults to `true`.
 * @param options.sourceMap - Whether to generate a source map for the modified
 * code. See also `inputSourceMap`.
 * @param options.inputSourceMap - The source map for the input code. When
 * provided, the source map will be used to generate a source map for the
 * modified code. This ensures that the source map is correct for the modified
 * code, and still points to the original source. If not provided, a new source
 * map will be generated instead.
 * @returns An object containing the modified code, and source map, or null if
 * the provided code is null.
 */
export function postProcessBundle(
  code: string,
  {
    stripComments = true,
    sourceMap: sourceMaps,
    inputSourceMap,
  }: Partial<PostProcessOptions> = {},
): PostProcessedBundle {
  const warnings = new Set<PostProcessWarning>();

  const pre: PluginObj['pre'] = ({ ast }) => {
    ast.comments?.forEach((comment) => {
      // Break up tokens that could be parsed as HTML comment terminators. The
      // regular expressions below are written strangely so as to avoid the
      // appearance of such tokens in our source code. For reference:
      // https://github.com/endojs/endo/blob/70cc86eb400655e922413b99c38818d7b2e79da0/packages/ses/error-codes/SES_HTML_COMMENT_REJECTED.md
      comment.value = comment.value
        .replace(new RegExp(`<!${'--'}`, 'gu'), '< !--')
        .replace(new RegExp(`${'--'}>`, 'gu'), '-- >')
        .replace(/import(\(.*\))/gu, 'import\\$1');
    });
  };

  const visitor: Visitor<Node> = {
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
          }),
        );
      }

      // Detect the use of `Math.random()` and add a warning.
      if (
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'Identifier' &&
        node.callee.object.name === 'Math' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'random'
      ) {
        warnings.add(PostProcessWarning.UnsafeMathRandom);
      }
    },

    MemberExpression(path) {
      const { node } = path;

      // Replace `object.eval(foo)` with `(1, object.eval)(foo)`.
      if (
        node.property.type === 'Identifier' &&
        node.property.name === 'eval' &&
        // We only apply this to MemberExpressions that are the callee of CallExpression
        path.parent.type === 'CallExpression' &&
        path.parent.callee === node
      ) {
        path.replaceWith(
          objectEvalWrapper({
            OBJECT: node.object,
            REF: node.property,
          }),
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
      // - https://github.com/MetaMask/snaps-monorepo/issues/505
      const [replacementQuasis, replacementExpressions] = node.quasis.reduce<
        [TemplateElement[], Expression[]]
      >(
        ([elements, expressions], quasi, index) => {
          // Note: Template literals have two variants, "cooked" and "raw". Here
          // we use the cooked version.
          // https://exploringjs.com/impatient-js/ch_template-literals.html#template-strings-cooked-vs-raw
          const tokens = breakTokensTemplateLiteral(
            quasi.value.cooked as string,
          );

          // Only update the node if something changed.
          if (tokens[0].length <= 1) {
            return [
              [...elements, quasi],
              [...expressions, node.expressions[index] as Expression],
            ];
          }

          return [
            [...elements, ...tokens[0]],
            [
              ...expressions,
              ...tokens[1],
              node.expressions[index] as Expression,
            ],
          ];
        },
        [[], []],
      );

      path.replaceWith(
        templateLiteral(
          replacementQuasis,
          replacementExpressions.filter(
            (expression) => expression !== undefined,
          ),
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
      // - https://github.com/MetaMask/snaps-monorepo/issues/505
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

    BinaryExpression(path) {
      const { node } = path;

      const errorMessage =
        'Using HTML comments (`<!--` and `-->`) as operators is not allowed. The behaviour of ' +
        'these comments is ambiguous, and differs per browser and environment. If you want ' +
        'to use them as operators, break them up into separate characters, i.e., `a-- > b` ' +
        'and `a < ! --b`.';

      if (
        node.operator === '<' &&
        isUnaryExpression(node.right) &&
        isUpdateExpression(node.right.argument) &&
        node.right.argument.operator === '--' &&
        node.left.end &&
        node.right.argument.argument.start
      ) {
        const expression = code.slice(
          node.left.end,
          node.right.argument.argument.start,
        );

        if (expression.includes('<!--')) {
          throw new Error(errorMessage);
        }
      }

      if (
        node.operator === '>' &&
        isUpdateExpression(node.left) &&
        node.left.operator === '--' &&
        node.left.argument.end &&
        node.right.start
      ) {
        const expression = code.slice(node.left.argument.end, node.right.start);

        if (expression.includes('-->')) {
          throw new Error(errorMessage);
        }
      }
    },
  };

  try {
    const file = transformSync(code, {
      // Prevent Babel from searching for a config file.
      configFile: false,

      parserOpts: {
        // Strict mode isn't enabled by default, so we need to enable it here.
        strictMode: true,

        // If this is disabled, the AST does not include any comments. This is
        // useful for performance reasons, and we use it for stripping comments.
        attachComment: !stripComments,
      },

      // By default, Babel optimises bundles that exceed 500 KB, but that
      // results in characters which look like HTML comments, which breaks SES.
      compact: false,

      // This configures Babel to generate a new source map from the existing
      // source map if specified. If `sourceMap` is `true` but an input source
      // map is not provided, a new source map will be generated instead.
      inputSourceMap,
      sourceMaps,

      plugins: [
        () => ({
          pre,
          visitor,
        }),
      ],
    });

    if (!file?.code) {
      throw new Error('Bundled code is empty.');
    }

    return {
      code: file.code,
      sourceMap: file.map,
      warnings: Array.from(warnings),
    };
  } catch (error) {
    throw new Error(`Failed to post process code:\n${error.message}`);
  }
}
