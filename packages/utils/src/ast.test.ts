import { getAST, getCode, postProcessAST } from './ast';

describe('getAST', () => {
  it('returns an AST for the provided code', () => {
    const code = `const foo = 'bar'; console.log(foo);`;

    // eslint-disable-next-line jest/no-restricted-matchers
    expect(getAST(code)).toMatchSnapshot();
  });

  it(`doesn't attach comments to the AST if configured`, () => {
    const code = `
      // This is a comment.
      const foo = 'bar';
    `;

    const ast = getAST(code, false);
    expect(getCode(ast)).not.toContain('// This is a comment.');
  });

  it('forwards parser errors', () => {
    // Invalid code
    const code = `const foo bar;`;

    expect(() => getAST(code)).toThrow(
      `Failed to parse the provided code to an AST:`,
    );
  });
});

describe('postProcessAST', () => {
  it('wraps eval', () => {
    const code = `
      eval(bar);
      foo.eval(bar, baz);
      foo.bar.eval(baz, qux);
      eval('<!-- foo -->');
      foo.eval('<!-- bar -->');
    `;

    const ast = getAST(code);
    const processedCode = postProcessAST(ast);

    expect(getCode(processedCode)).toMatchInlineSnapshot(`
      "(1, eval)(bar);
      (1, foo.eval)(bar, baz);
      (1, foo.bar.eval)(baz, qux);
      (1, eval)(\\"<!\\" + \\"--\\" + \\" foo \\" + \\"--\\" + \\">\\");
      (1, foo.eval)(\\"<!\\" + \\"--\\" + \\" bar \\" + \\"--\\" + \\">\\");"
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

    const ast = getAST(code);
    const processedCode = postProcessAST(ast);

    expect(getCode(processedCode)).toMatchInlineSnapshot(`
      "(function (foo) {
        const bar = 'baz';
      });

      function foo(Buffer) {
        const bar = 'baz';
      }"
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

    const ast = getAST(code);
    const processedCode = postProcessAST(ast);

    expect(getCode(processedCode)).toMatchInlineSnapshot(`
      "var regeneratorRuntime;

      function foo() {
        regeneratorRuntime.foo();
      }

      function bar() {
        regeneratorRuntime.bar();
      }"
    `);
  });

  it('does not insert the regenerator runtime global when not used', () => {
    const code = `
      const foo = 'regeneratorRuntime';
    `;

    const ast = getAST(code);
    const processedCode = postProcessAST(ast);

    expect(getCode(processedCode)).toMatchInlineSnapshot(
      `"const foo = 'regeneratorRuntime';"`,
    );
  });

  it('breaks up HTML comment terminators in operators', () => {
    const code = `
      let a = 5;
      let b = 7;
      const c = a --> b;
      const d = a <!-- b;
    `;

    const ast = getAST(code);
    const processedCode = postProcessAST(ast);

    expect(getCode(processedCode)).toMatchInlineSnapshot(`
      "let a = 5;
      let b = 7;
      const c = a-- > b;
      const d = a < ! --b;"
    `);
  });

  it('breaks up HTML comment terminators in string literals', () => {
    const code = `
      const foo = '<!-- bar -->';
    `;

    const ast = getAST(code);
    const processedCode = postProcessAST(ast);

    expect(getCode(processedCode)).toMatchInlineSnapshot(
      `"const foo = \\"<!\\" + \\"--\\" + \\" bar \\" + \\"--\\" + \\">\\";"`,
    );
  });

  it('breaks up `import()` in string literals', () => {
    const code = `
      const foo = 'foo bar import() baz';
      const bar = 'foo bar import(this works too) baz';
    `;

    const ast = getAST(code);
    const processedCode = postProcessAST(ast);

    expect(getCode(processedCode)).toMatchInlineSnapshot(`
      "const foo = \\"foo bar \\" + \\"import\\" + \\"()\\" + \\" baz\\";
      const bar = \\"foo bar \\" + \\"import\\" + \\"(this works too)\\" + \\" baz\\";"
    `);
  });

  it('breaks up HTML comment terminators in template literals', () => {
    const code = `
      const foo = \`<!-- bar --> \${'<!-- baz -->'} \${qux}\`;
    `;

    const ast = getAST(code);
    const processedCode = postProcessAST(ast);

    expect(getCode(processedCode)).toMatchInlineSnapshot(
      `"const foo = \`\${\\"<!\\"}\${\\"--\\"} bar \${\\"--\\"}\${\\">\\"} \${\\"<!\\" + \\"--\\" + \\" baz \\" + \\"--\\" + \\">\\"} \${qux}\`;"`,
    );
  });

  it('breaks up `import()` in template literals', () => {
    const code = `
      const foo = \`foo bar import() baz\`;
      const bar = \`foo bar import(this works too) baz\`;
      foo\`
        foo import() \${'import(bar)'} \${qux}\
      \`;
    `;

    const ast = getAST(code);
    const processedCode = postProcessAST(ast);

    expect(getCode(processedCode)).toMatchInlineSnapshot(`
      "const foo = \`foo bar \${\\"import\\"}\${\\"()\\"} baz\`;
      const bar = \`foo bar \${\\"import\\"}\${\\"(this works too)\\"} baz\`;
      foo\`
              foo \${\\"import\\"}\${\\"()\\"} \${\\"import\\" + \\"(bar)\\"} \${qux}      \`;"
    `);
  });

  it('breaks up HTML comment terminators in comments', () => {
    const code = `
      <!-- foo -->
    `;

    const ast = getAST(code);
    const processedCode = postProcessAST(ast);

    expect(getCode(processedCode)).toMatchInlineSnapshot(`"// foo -- >"`);
  });

  it('breaks up `import()` in comments', () => {
    const code = `
      // Foo bar import() baz
      // Foo bar import(baz) qux
    `;

    const ast = getAST(code);
    const processedCode = postProcessAST(ast);

    expect(getCode(processedCode)).toMatchInlineSnapshot(`
      "// Foo bar import\\\\() baz
      // Foo bar import\\\\(baz) qux"
    `);
  });

  it(`doesn't break on empty string literals`, () => {
    const code = `
      const foo = '';
    `;

    const ast = getAST(code);
    const processedCode = postProcessAST(ast);

    expect(getCode(processedCode)).toMatchInlineSnapshot(`"const foo = '';"`);
  });

  it(`doesn't process values that don't contain special tokens`, () => {
    const code = `
      const empty = '';
      const foo = 'foo';
      const bar = \`bar\${foo}\`;
    `;

    const ast = getAST(code);
    const processedCode = postProcessAST(ast);

    expect(getCode(processedCode)).toMatchInlineSnapshot(`
      "const empty = '';
      const foo = 'foo';
      const bar = \`bar\${foo}\`;"
    `);
  });

  it(`doesn't break template literals with special characters`, () => {
    // eslint-disable-next-line
    const code = 'const foo = `<!-- \\` ${foo} \\` -->`;';

    const ast = getAST(code);
    const processedCode = postProcessAST(ast);

    expect(getCode(processedCode)).toMatchInlineSnapshot(
      `"const foo = \`\${\\"<!\\"}\${\\"--\\"} \\\\\` \${foo} \\\\\` \${\\"--\\"}\${\\">\\"}\`;"`,
    );
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

    const ast = getAST(code, false);
    const processedCode = postProcessAST(ast);

    expect(getCode(processedCode)).toMatchInlineSnapshot(`
      "var regeneratorRuntime;

      (function (foo) {
        const bar = \\"<!\\" + \\"--\\" + \\" baz \\" + \\"--\\" + \\">\\" + \\" \\" + \\"import\\" + \\"()\\" + \\"; \\" + \\"import\\" + \\"(foo)\\" + \\";\\";
        const baz = \`\${\\"<!\\"}\${\\"--\\"} baz \${\\"--\\"}\${\\">\\"} \${\\"import\\" + \\"()\\" + \\";\\"} \${\\"import\\"}\${\\"(foo)\\"};\`;
        regeneratorRuntime.foo(\\"import\\" + \\"()\\");
        (1, eval)(foo);
        (1, foo.eval)('bar');
      });"
    `);
  });
});
