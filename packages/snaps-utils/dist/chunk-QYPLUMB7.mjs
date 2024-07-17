// src/post-process.ts
import { transformSync, template } from "@babel/core";
import {
  binaryExpression,
  isUnaryExpression,
  isUpdateExpression,
  stringLiteral,
  templateElement,
  templateLiteral
} from "@babel/types";
var PostProcessWarning = /* @__PURE__ */ ((PostProcessWarning2) => {
  PostProcessWarning2["UnsafeMathRandom"] = "`Math.random` was detected in the Snap bundle. This is not a secure source of randomness, and should not be used in a secure context. Use `crypto.getRandomValues` instead.";
  return PostProcessWarning2;
})(PostProcessWarning || {});
var TOKEN_REGEX = /(<!)(--)|(--)(>)|(--)(!)(>)|(import)(\(.*?\))/gu;
var EMPTY_TEMPLATE_ELEMENT = templateElement({ raw: "", cooked: "" });
var evalWrapper = template.statement(`
  (1, REF)(ARGS)
`);
var objectEvalWrapper = template.statement(`
  (1, OBJECT.REF)
`);
var regeneratorRuntimeWrapper = template.statement(`
  var regeneratorRuntime;
`);
function breakTokens(value) {
  const tokens = value.split(TOKEN_REGEX);
  return tokens.filter((token) => token !== "" && token !== void 0);
}
function breakTokensTemplateLiteral(value) {
  const matches = Array.from(value.matchAll(TOKEN_REGEX));
  if (matches.length > 0) {
    const output = matches.reduce(
      ([elements, expressions], rawMatch, index, values) => {
        const [, first, last] = rawMatch.filter((raw) => raw !== void 0);
        const prefix = value.slice(
          index === 0 ? 0 : values[index - 1].index + values[index - 1][0].length,
          rawMatch.index
        );
        return [
          [
            ...elements,
            templateElement({
              raw: getRawTemplateValue(prefix),
              cooked: prefix
            }),
            EMPTY_TEMPLATE_ELEMENT
          ],
          [...expressions, stringLiteral(first), stringLiteral(last)]
        ];
      },
      [[], []]
    );
    const lastMatch = matches[matches.length - 1];
    const suffix = value.slice(
      lastMatch.index + lastMatch[0].length
    );
    return [
      [
        ...output[0],
        templateElement({ raw: getRawTemplateValue(suffix), cooked: suffix })
      ],
      output[1]
    ];
  }
  return [
    [templateElement({ raw: getRawTemplateValue(value), cooked: value })],
    []
  ];
}
function getRawTemplateValue(value) {
  return value.replace(/\\|`|\$\{/gu, "\\$&");
}
function postProcessBundle(code, {
  stripComments = true,
  sourceMap: sourceMaps,
  inputSourceMap
} = {}) {
  const warnings = /* @__PURE__ */ new Set();
  const pre = ({ ast }) => {
    ast.comments?.forEach((comment) => {
      comment.value = comment.value.replace(new RegExp(`<!${"--"}`, "gu"), "< !--").replace(new RegExp(`${"--"}>`, "gu"), "-- >").replace(/import(\(.*\))/gu, "import\\$1");
    });
  };
  const visitor = {
    FunctionExpression(path) {
      const { node } = path;
      if (node.type === "FunctionExpression" && node.extra?.parenthesized) {
        node.params = node.params.filter(
          (param) => !(param.type === "Identifier" && param.name === "Buffer")
        );
      }
    },
    CallExpression(path) {
      const { node } = path;
      if (node.callee.type === "Identifier" && node.callee.name === "eval") {
        path.replaceWith(
          evalWrapper({
            REF: node.callee,
            ARGS: node.arguments
          })
        );
      }
      if (node.callee.type === "MemberExpression" && node.callee.object.type === "Identifier" && node.callee.object.name === "Math" && node.callee.property.type === "Identifier" && node.callee.property.name === "random") {
        warnings.add("`Math.random` was detected in the Snap bundle. This is not a secure source of randomness, and should not be used in a secure context. Use `crypto.getRandomValues` instead." /* UnsafeMathRandom */);
      }
    },
    MemberExpression(path) {
      const { node } = path;
      if (node.property.type === "Identifier" && node.property.name === "eval" && // We only apply this to MemberExpressions that are the callee of CallExpression
      path.parent.type === "CallExpression" && path.parent.callee === node) {
        path.replaceWith(
          objectEvalWrapper({
            OBJECT: node.object,
            REF: node.property
          })
        );
      }
    },
    Identifier(path) {
      const { node } = path;
      if (node.name === "regeneratorRuntime") {
        const program = path.findParent(
          (parent) => parent.node.type === "Program"
        );
        if (program?.node.type === "Program") {
          const body = program.node.body[0];
          if (body.type === "VariableDeclaration" && body.declarations[0].id.name === "regeneratorRuntime") {
            return;
          }
          program?.node.body.unshift(regeneratorRuntimeWrapper());
        }
      }
    },
    TemplateLiteral(path) {
      const { node } = path;
      if (path.getData("visited")) {
        return;
      }
      const [replacementQuasis, replacementExpressions] = node.quasis.reduce(
        ([elements, expressions], quasi, index) => {
          const tokens = breakTokensTemplateLiteral(
            quasi.value.cooked
          );
          if (tokens[0].length <= 1) {
            return [
              [...elements, quasi],
              [...expressions, node.expressions[index]]
            ];
          }
          return [
            [...elements, ...tokens[0]],
            [
              ...expressions,
              ...tokens[1],
              node.expressions[index]
            ]
          ];
        },
        [[], []]
      );
      path.replaceWith(
        templateLiteral(
          replacementQuasis,
          replacementExpressions.filter(
            (expression) => expression !== void 0
          )
        )
      );
      path.setData("visited", true);
    },
    StringLiteral(path) {
      const { node } = path;
      const tokens = breakTokens(node.value);
      if (tokens.length <= 1) {
        return;
      }
      const replacement = tokens.slice(1).reduce(
        (acc, value) => binaryExpression("+", acc, stringLiteral(value)),
        stringLiteral(tokens[0])
      );
      path.replaceWith(replacement);
      path.skip();
    },
    BinaryExpression(path) {
      const { node } = path;
      const errorMessage = "Using HTML comments (`<!--` and `-->`) as operators is not allowed. The behaviour of these comments is ambiguous, and differs per browser and environment. If you want to use them as operators, break them up into separate characters, i.e., `a-- > b` and `a < ! --b`.";
      if (node.operator === "<" && isUnaryExpression(node.right) && isUpdateExpression(node.right.argument) && node.right.argument.operator === "--" && node.left.end && node.right.argument.argument.start) {
        const expression = code.slice(
          node.left.end,
          node.right.argument.argument.start
        );
        if (expression.includes("<!--")) {
          throw new Error(errorMessage);
        }
      }
      if (node.operator === ">" && isUpdateExpression(node.left) && node.left.operator === "--" && node.left.argument.end && node.right.start) {
        const expression = code.slice(node.left.argument.end, node.right.start);
        if (expression.includes("-->")) {
          throw new Error(errorMessage);
        }
      }
    }
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
        attachComment: !stripComments
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
          visitor
        })
      ]
    });
    if (!file?.code) {
      throw new Error("Bundled code is empty.");
    }
    return {
      code: file.code,
      sourceMap: file.map,
      warnings: Array.from(warnings)
    };
  } catch (error) {
    throw new Error(`Failed to post process code:
${error.message}`);
  }
}

export {
  PostProcessWarning,
  postProcessBundle
};
//# sourceMappingURL=chunk-QYPLUMB7.mjs.map