// eslint-disable-next-line @typescript-eslint/no-shadow
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    PostProcessWarning: function() {
        return PostProcessWarning;
    },
    postProcessBundle: function() {
        return postProcessBundle;
    }
});
const _core = require("@babel/core");
const _types = require("@babel/types");
var PostProcessWarning;
(function(PostProcessWarning) {
    PostProcessWarning["UnsafeMathRandom"] = '`Math.random` was detected in the bundle. This is not a secure source of randomness.';
})(PostProcessWarning || (PostProcessWarning = {}));
// The RegEx below consists of multiple groups joined by a boolean OR.
// Each part consists of two groups which capture a part of each string
// which needs to be split up, e.g., `<!--` is split into `<!` and `--`.
const TOKEN_REGEX = /(<!)(--)|(--)(>)|(import)(\(.*?\))/gu;
// An empty template element, i.e., a part of a template literal without any
// value ("").
const EMPTY_TEMPLATE_ELEMENT = (0, _types.templateElement)({
    raw: '',
    cooked: ''
});
const evalWrapper = _core.template.statement(`
  (1, REF)(ARGS)
`);
const objectEvalWrapper = _core.template.statement(`
  (1, OBJECT.REF)
`);
const regeneratorRuntimeWrapper = _core.template.statement(`
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
 */ function breakTokens(value) {
    const tokens = value.split(TOKEN_REGEX);
    return tokens// TODO: The `split` above results in some values being `undefined`.
    // There may be a better solution to avoid having to filter those out.
    .filter((token)=>token !== '' && token !== undefined);
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
 */ function breakTokensTemplateLiteral(value) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore `matchAll` is not available in ES2017, but this code
    // should only be used in environments where the function is supported.
    const matches = Array.from(value.matchAll(TOKEN_REGEX));
    if (matches.length > 0) {
        const output = matches.reduce(([elements, expressions], rawMatch, index, values)=>{
            const [, first, last] = rawMatch.filter((raw)=>raw !== undefined);
            // Slice the text in front of the match, which does not need to be
            // broken up.
            const prefix = value.slice(index === 0 ? 0 : values[index - 1].index + values[index - 1][0].length, rawMatch.index);
            return [
                [
                    ...elements,
                    (0, _types.templateElement)({
                        raw: getRawTemplateValue(prefix),
                        cooked: prefix
                    }),
                    EMPTY_TEMPLATE_ELEMENT
                ],
                [
                    ...expressions,
                    (0, _types.stringLiteral)(first),
                    (0, _types.stringLiteral)(last)
                ]
            ];
        }, [
            [],
            []
        ]);
        // Add the text after the last match to the output.
        const lastMatch = matches[matches.length - 1];
        const suffix = value.slice(lastMatch.index + lastMatch[0].length);
        return [
            [
                ...output[0],
                (0, _types.templateElement)({
                    raw: getRawTemplateValue(suffix),
                    cooked: suffix
                })
            ],
            output[1]
        ];
    }
    // If there are no matches, simply return the original value.
    return [
        [
            (0, _types.templateElement)({
                raw: getRawTemplateValue(value),
                cooked: value
            })
        ],
        []
    ];
}
/**
 * Get a raw template literal value from a cooked value. This adds a backslash
 * before every '`', '\' and '${' characters.
 *
 * @see https://github.com/babel/babel/issues/9242#issuecomment-532529613
 * @param value - The cooked string to get the raw string for.
 * @returns The value as raw value.
 */ function getRawTemplateValue(value) {
    return value.replace(/\\|`|\$\{/gu, '\\$&');
}
function postProcessBundle(code, { stripComments = true, sourceMap: sourceMaps, inputSourceMap } = {}) {
    const warnings = new Set();
    const pre = ({ ast })=>{
        ast.comments?.forEach((comment)=>{
            // Break up tokens that could be parsed as HTML comment terminators. The
            // regular expressions below are written strangely so as to avoid the
            // appearance of such tokens in our source code. For reference:
            // https://github.com/endojs/endo/blob/70cc86eb400655e922413b99c38818d7b2e79da0/packages/ses/error-codes/SES_HTML_COMMENT_REJECTED.md
            comment.value = comment.value.replace(new RegExp(`<!${'--'}`, 'gu'), '< !--').replace(new RegExp(`${'--'}>`, 'gu'), '-- >').replace(/import(\(.*\))/gu, 'import\\$1');
        });
    };
    const visitor = {
        FunctionExpression (path) {
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
                node.params = node.params.filter((param)=>!(param.type === 'Identifier' && param.name === 'Buffer'));
            }
        },
        CallExpression (path) {
            const { node } = path;
            // Replace `eval(foo)` with `(1, eval)(foo)`.
            if (node.callee.type === 'Identifier' && node.callee.name === 'eval') {
                path.replaceWith(evalWrapper({
                    REF: node.callee,
                    ARGS: node.arguments
                }));
            }
            // Detect the use of `Math.random()` and add a warning.
            if (node.callee.type === 'MemberExpression' && node.callee.object.type === 'Identifier' && node.callee.object.name === 'Math' && node.callee.property.type === 'Identifier' && node.callee.property.name === 'random') {
                warnings.add(PostProcessWarning.UnsafeMathRandom);
            }
        },
        MemberExpression (path) {
            const { node } = path;
            // Replace `object.eval(foo)` with `(1, object.eval)(foo)`.
            if (node.property.type === 'Identifier' && node.property.name === 'eval' && // We only apply this to MemberExpressions that are the callee of CallExpression
            path.parent.type === 'CallExpression' && path.parent.callee === node) {
                path.replaceWith(objectEvalWrapper({
                    OBJECT: node.object,
                    REF: node.property
                }));
            }
        },
        Identifier (path) {
            const { node } = path;
            // Insert `regeneratorRuntime` global if it's used in the code.
            if (node.name === 'regeneratorRuntime') {
                const program = path.findParent((parent)=>parent.node.type === 'Program');
                // We know that `program` is a Program node here, but this keeps
                // TypeScript happy.
                if (program?.node.type === 'Program') {
                    const body = program.node.body[0];
                    // This stops it from inserting `regeneratorRuntime` multiple times.
                    if (body.type === 'VariableDeclaration' && body.declarations[0].id.name === 'regeneratorRuntime') {
                        return;
                    }
                    program?.node.body.unshift(regeneratorRuntimeWrapper());
                }
            }
        },
        TemplateLiteral (path) {
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
            const [replacementQuasis, replacementExpressions] = node.quasis.reduce(([elements, expressions], quasi, index)=>{
                // Note: Template literals have two variants, "cooked" and "raw". Here
                // we use the cooked version.
                // https://exploringjs.com/impatient-js/ch_template-literals.html#template-strings-cooked-vs-raw
                const tokens = breakTokensTemplateLiteral(quasi.value.cooked);
                // Only update the node if something changed.
                if (tokens[0].length <= 1) {
                    return [
                        [
                            ...elements,
                            quasi
                        ],
                        [
                            ...expressions,
                            node.expressions[index]
                        ]
                    ];
                }
                return [
                    [
                        ...elements,
                        ...tokens[0]
                    ],
                    [
                        ...expressions,
                        ...tokens[1],
                        node.expressions[index]
                    ]
                ];
            }, [
                [],
                []
            ]);
            path.replaceWith((0, _types.templateLiteral)(replacementQuasis, replacementExpressions.filter((expression)=>expression !== undefined)));
            path.setData('visited', true);
        },
        StringLiteral (path) {
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
            const replacement = tokens.slice(1).reduce((acc, value)=>(0, _types.binaryExpression)('+', acc, (0, _types.stringLiteral)(value)), (0, _types.stringLiteral)(tokens[0]));
            path.replaceWith(replacement);
            path.skip();
        },
        BinaryExpression (path) {
            const { node } = path;
            const errorMessage = 'Using HTML comments (`<!--` and `-->`) as operators is not allowed. The behaviour of ' + 'these comments is ambiguous, and differs per browser and environment. If you want ' + 'to use them as operators, break them up into separate characters, i.e., `a-- > b` ' + 'and `a < ! --b`.';
            if (node.operator === '<' && (0, _types.isUnaryExpression)(node.right) && (0, _types.isUpdateExpression)(node.right.argument) && node.right.argument.operator === '--' && node.left.end && node.right.argument.argument.start) {
                const expression = code.slice(node.left.end, node.right.argument.argument.start);
                if (expression.includes('<!--')) {
                    throw new Error(errorMessage);
                }
            }
            if (node.operator === '>' && (0, _types.isUpdateExpression)(node.left) && node.left.operator === '--' && node.left.argument.end && node.right.start) {
                const expression = code.slice(node.left.argument.end, node.right.start);
                if (expression.includes('-->')) {
                    throw new Error(errorMessage);
                }
            }
        }
    };
    try {
        const file = (0, _core.transformSync)(code, {
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
                ()=>({
                        pre,
                        visitor
                    })
            ]
        });
        if (!file?.code) {
            throw new Error('Bundled code is empty.');
        }
        return {
            code: file.code,
            sourceMap: file.map,
            warnings: Array.from(warnings)
        };
    } catch (error) {
        throw new Error(`Failed to post process code:\n${error.message}`);
    }
}

//# sourceMappingURL=post-process.js.map