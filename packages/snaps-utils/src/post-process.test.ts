import { postProcessBundle, PostProcessWarning } from './post-process';

describe('postProcessBundle', () => {
  it('trims the string', () => {
    expect(postProcessBundle(' trimMe(); ')).toStrictEqual(
      expect.objectContaining({
        code: 'trimMe();',
      }),
    );
  });

  it('strips comments', () => {
    [
      ['/* delete me */postProcessMe();', 'postProcessMe();'],
      ['oi();// hello\npostProcessMe();', 'oi();\npostProcessMe();'],
      ['oi();/**********/\npostProcessMe();//hello', 'oi();\npostProcessMe();'],
      ['oi();/***/\npostProcessMe();//hello', 'oi();\npostProcessMe();'],
      // We used to have issues with this one and our comment stripping
      ['oi();/**/\npostProcessMe();//hello', 'oi();\npostProcessMe();'],
      ['foo();/** /* **/bar();', 'foo();\nbar();'],
      ['foo();/** /** **/bar();', 'foo();\nbar();'],
    ].forEach(([input, expected]) => {
      expect(postProcessBundle(input)).toStrictEqual(
        expect.objectContaining({
          code: expected,
        }),
      );
    });
  });

  it('ignores comments if configured to do so', () => {
    expect(
      postProcessBundle('/* leave me alone */postProcessMe();', {
        stripComments: false,
      }),
    ).toStrictEqual(
      expect.objectContaining({
        code: '/* leave me alone */postProcessMe();',
      }),
    );
  });

  it('wraps eval', () => {
    const code = `
      eval(bar);
      foo.eval(bar, baz);
      foo.bar.eval(baz, qux);
      eval('<!-- foo -->');
      foo.eval('<!-- bar -->');
    `;

    const processedCode = postProcessBundle(code);
    expect(processedCode).toMatchInlineSnapshot(`
      {
        "code": "(1, eval)(bar);
      (1, foo.eval)(bar, baz);
      (1, foo.bar.eval)(baz, qux);
      (1, eval)("<!" + "--" + " foo " + "--" + ">");
      (1, foo.eval)("<!" + "--" + " bar " + "--" + ">");",
        "sourceMap": null,
        "warnings": [],
      }
    `);
  });

  it('allows eval assignments', () => {
    const code = `
      foo.eval = null;
    `;

    const processedCode = postProcessBundle(code);
    expect(processedCode).toMatchInlineSnapshot(`
      {
        "code": "foo.eval = null;",
        "sourceMap": null,
        "warnings": [],
      }
    `);
  });

  it('removes the Buffer argument', () => {
    const code = `
      (function (Buffer, foo) {
        const bar = 'baz';
      });

      function foo(Buffer) {
        const bar = 'baz';
      }
    `;

    const processedCode = postProcessBundle(code);
    expect(processedCode).toMatchInlineSnapshot(`
      {
        "code": "(function (foo) {
        const bar = 'baz';
      });
      function foo(Buffer) {
        const bar = 'baz';
      }",
        "sourceMap": null,
        "warnings": [],
      }
    `);
  });

  it('inserts the regenerator runtime global when used', () => {
    const code = `
      function foo() {
        regeneratorRuntime.foo();
      }

      function bar() {
        regeneratorRuntime.bar();
      }
    `;

    const processedCode = postProcessBundle(code);
    expect(processedCode).toMatchInlineSnapshot(`
      {
        "code": "var regeneratorRuntime;
      function foo() {
        regeneratorRuntime.foo();
      }
      function bar() {
        regeneratorRuntime.bar();
      }",
        "sourceMap": null,
        "warnings": [],
      }
    `);
  });

  it('inserts the regenerator runtime global when used indirectly', () => {
    expect(postProcessBundle('var _marked = [a].map(regeneratorRuntime.mark);'))
      .toMatchInlineSnapshot(`
      {
        "code": "var regeneratorRuntime;
      var _marked = [a].map(regeneratorRuntime.mark);",
        "sourceMap": null,
        "warnings": [],
      }
    `);
  });

  it('does not insert the regenerator runtime global when not used', () => {
    const code = `
      const foo = 'regeneratorRuntime';
    `;

    const processedCode = postProcessBundle(code);
    expect(processedCode).toMatchInlineSnapshot(`
      {
        "code": "const foo = 'regeneratorRuntime';",
        "sourceMap": null,
        "warnings": [],
      }
    `);
  });

  it('breaks up HTML comment terminators in string literals', () => {
    const code = `
      const foo = '<!-- bar -->';
    `;

    const processedCode = postProcessBundle(code);
    expect(processedCode).toMatchInlineSnapshot(`
      {
        "code": "const foo = "<!" + "--" + " bar " + "--" + ">";",
        "sourceMap": null,
        "warnings": [],
      }
    `);
  });

  it('breaks up `import()` in string literals', () => {
    const code = `
      const foo = 'foo bar import() baz';
      const bar = 'foo bar import(this works too) baz';
    `;

    const processedCode = postProcessBundle(code);
    expect(processedCode).toMatchInlineSnapshot(`
      {
        "code": "const foo = "foo bar " + "import" + "()" + " baz";
      const bar = "foo bar " + "import" + "(this works too)" + " baz";",
        "sourceMap": null,
        "warnings": [],
      }
    `);
  });

  it('breaks up HTML comment terminators in template literals', () => {
    const code = `
      const foo = \`<!-- bar --> \${'<!-- baz -->'} \${qux}\`;
    `;

    const processedCode = postProcessBundle(code);
    expect(processedCode).toMatchInlineSnapshot(`
      {
        "code": "const foo = \`\${"<!"}\${"--"} bar \${"--"}\${">"} \${"<!" + "--" + " baz " + "--" + ">"} \${qux}\`;",
        "sourceMap": null,
        "warnings": [],
      }
    `);
  });

  it('breaks up `import()` in template literals', () => {
    const code = `
      const foo = \`foo bar import() baz\`;
      const bar = \`foo bar import(this works too) baz\`;
      foo\`
        foo import() \${'import(bar)'} \${qux}\
      \`;
    `;

    const processedCode = postProcessBundle(code);
    expect(processedCode).toMatchInlineSnapshot(`
      {
        "code": "const foo = \`foo bar \${"import"}\${"()"} baz\`;
      const bar = \`foo bar \${"import"}\${"(this works too)"} baz\`;
      foo\`
              foo \${"import"}\${"()"} \${"import" + "(bar)"} \${qux}      \`;",
        "sourceMap": null,
        "warnings": [],
      }
    `);
  });

  it('breaks up HTML comment terminators in comments', () => {
    const code = `
      // <!-- foo -->
    `;

    const processedCode = postProcessBundle(code, { stripComments: false });
    expect(processedCode).toMatchInlineSnapshot(`
      {
        "code": "
      // < !-- foo -- >",
        "sourceMap": null,
        "warnings": [],
      }
    `);
  });

  it('breaks up `import()` in comments', () => {
    const code = `
      // Foo bar import() baz
      // Foo bar import(baz) qux
    `;

    const processedCode = postProcessBundle(code, { stripComments: false });
    expect(processedCode).toMatchInlineSnapshot(`
      {
        "code": "
      // Foo bar import\\() baz
      // Foo bar import\\(baz) qux",
        "sourceMap": null,
        "warnings": [],
      }
    `);
  });

  it(`doesn't break on empty string literals`, () => {
    const code = `
      const foo = '';
    `;

    const processedCode = postProcessBundle(code);
    expect(processedCode).toMatchInlineSnapshot(`
      {
        "code": "const foo = '';",
        "sourceMap": null,
        "warnings": [],
      }
    `);
  });

  it(`doesn't process values that don't contain special tokens`, () => {
    const code = `
      const empty = '';
      const foo = 'foo';
      const bar = \`bar\${foo}\`;
    `;

    const processedCode = postProcessBundle(code);
    expect(processedCode).toMatchInlineSnapshot(`
      {
        "code": "const empty = '';
      const foo = 'foo';
      const bar = \`bar\${foo}\`;",
        "sourceMap": null,
        "warnings": [],
      }
    `);
  });

  it(`doesn't break template literals with special characters`, () => {
    // eslint-disable-next-line
    const code = 'const foo = `<!-- \\` ${foo} \\` -->`;';

    const processedCode = postProcessBundle(code);
    expect(processedCode).toMatchInlineSnapshot(`
      {
        "code": "const foo = \`\${"<!"}\${"--"} \\\` \${foo} \\\` \${"--"}\${">"}\`;",
        "sourceMap": null,
        "warnings": [],
      }
    `);
  });

  it(`doesn't throw for strings that contain HTML comment tokens inside binary expressions`, () => {
    const code = `
      const foo = foo() + '<!-- bar -->' + baz();
      const bar = foo() + \`<!-- bar -->\` + baz();
    `;

    expect(() => postProcessBundle(code)).not.toThrow();
  });

  it.each(['const a = b <!-- c;', 'const a = b --> c;'])(
    'throws an error when HTML comment tokens are used as operators',
    (code) => {
      expect(() => postProcessBundle(code)).toThrow(
        'Using HTML comments (`<!--` and `-->`) as operators is not allowed.',
      );
    },
  );

  it('throws an error if the postprocessed string is empty', () => {
    expect(() => postProcessBundle(' ')).toThrow('Bundled code is empty.');
  });

  it('processes all the things', () => {
    const code = `
      (function (Buffer, foo) {
        // Sets 'bar' to 'baz'
        const bar = '<!-- baz --> import(); import(foo);';
        const baz = \`<!-- baz --> \${'import();'} import(foo);\`;
        regeneratorRuntime.foo('import()');
        eval(foo);
        foo.eval('bar');
      });
    `;

    const processedCode = postProcessBundle(code);
    expect(processedCode).toMatchInlineSnapshot(`
      {
        "code": "var regeneratorRuntime;
      (function (foo) {
        const bar = "<!" + "--" + " baz " + "--" + ">" + " " + "import" + "()" + "; " + "import" + "(foo)" + ";";
        const baz = \`\${"<!"}\${"--"} baz \${"--"}\${">"} \${"import" + "()" + ";"} \${"import"}\${"(foo)"};\`;
        regeneratorRuntime.foo("import" + "()");
        (1, eval)(foo);
        (1, foo.eval)('bar');
      });",
        "sourceMap": null,
        "warnings": [],
      }
    `);
  });

  it('forwards parser errors', () => {
    // Invalid code
    const code = `const`;

    expect(() => postProcessBundle(code)).toThrow(
      `Failed to post process code`,
    );
  });

  it('generates a source map if configured', () => {
    const code = `
      const foo = 'bar';
    `;

    const processedCode = postProcessBundle(code, {
      sourceMap: true,
    });

    expect(processedCode).toMatchInlineSnapshot(`
      {
        "code": "const foo = 'bar';",
        "sourceMap": {
          "file": undefined,
          "mappings": "AACM,MAAMA,GAAG,GAAG,KAAK",
          "names": [
            "foo",
          ],
          "sourceRoot": undefined,
          "sources": [
            "unknown",
          ],
          "sourcesContent": [
            "
            const foo = 'bar';
          ",
          ],
          "version": 3,
        },
        "warnings": [],
      }
    `);
  });

  it('generates an inline source map if configured', () => {
    const code = `
      const foo = 'bar';
    `;

    const processedCode = postProcessBundle(code, {
      sourceMap: 'inline',
    });

    expect(processedCode).toMatchInlineSnapshot(`
      {
        "code": "const foo = 'bar';
      //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmb28iXSwic291cmNlcyI6WyJ1bmtub3duIl0sInNvdXJjZXNDb250ZW50IjpbIlxuICAgICAgY29uc3QgZm9vID0gJ2Jhcic7XG4gICAgIl0sIm1hcHBpbmdzIjoiQUFDTSxNQUFNQSxHQUFHLEdBQUcsS0FBSyJ9",
        "sourceMap": null,
        "warnings": [],
      }
    `);
  });

  it('merges source maps if an input source map is provided', () => {
    // Original code: `export const foo = 'bar';`, compiled with TypeScript.
    const code = `
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.foo = void 0;
      exports.foo = 'bar';
    `;

    const inputSourceMap = {
      version: 3,
      file: 'foo.js',
      sourceRoot: '',
      sources: ['../src/foo.ts'],
      names: [],
      mappings: ';;;AAAa,QAAA,GAAG,GAAG,KAAK,CAAC',
    };

    const processedCode = postProcessBundle(code, {
      sourceMap: true,
      inputSourceMap,
    });

    expect(processedCode).toMatchInlineSnapshot(`
      {
        "code": ""use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.foo = void 0;
      exports.foo = 'bar';",
        "sourceMap": {
          "file": undefined,
          "mappings": ";;;;;AAAaA,OAAG,CAAGC,GAAA,GAAM",
          "names": [
            "exports",
            "foo",
          ],
          "sourceRoot": undefined,
          "sources": [
            "../src/foo.ts",
          ],
          "sourcesContent": [
            undefined,
          ],
          "version": 3,
        },
        "warnings": [],
      }
    `);
  });

  it('returns a warning when using Math.random', () => {
    const code = `
      const foo = Math.random();
    `;

    const { warnings } = postProcessBundle(code);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toBe(PostProcessWarning.UnsafeMathRandom);
  });
});
