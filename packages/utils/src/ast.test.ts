import { postProcessAST } from './ast';

describe('postProcessAST', () => {
  it('wraps eval', () => {
    const code = `
      eval(bar);
      foo.eval(bar, baz);
      foo.bar.eval(baz, qux);
      eval('<!-- foo -->');
      foo.eval('<!-- bar -->');
    `;

    const processedCode = postProcessAST(code);
    expect(processedCode).toMatchInlineSnapshot(`
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

    const processedCode = postProcessAST(code);
    expect(processedCode).toMatchInlineSnapshot(`
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

    const processedCode = postProcessAST(code);
    expect(processedCode).toMatchInlineSnapshot(`
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

    const processedCode = postProcessAST(code);
    expect(processedCode).toMatchInlineSnapshot(
      `"const foo = 'regeneratorRuntime';"`,
    );
  });

  it('breaks up HTML comment terminators in string literals', () => {
    const code = `
      const foo = '<!-- bar -->';
    `;

    const processedCode = postProcessAST(code);
    expect(processedCode).toMatchInlineSnapshot(
      `"const foo = \\"<!\\" + \\"--\\" + \\" bar \\" + \\"--\\" + \\">\\";"`,
    );
  });

  it('breaks up `import()` in string literals', () => {
    const code = `
      const foo = 'foo bar import() baz';
      const bar = 'foo bar import(this works too) baz';
    `;

    const processedCode = postProcessAST(code);
    expect(processedCode).toMatchInlineSnapshot(`
      "const foo = \\"foo bar \\" + \\"import\\" + \\"()\\" + \\" baz\\";
      const bar = \\"foo bar \\" + \\"import\\" + \\"(this works too)\\" + \\" baz\\";"
    `);
  });

  it('breaks up HTML comment terminators in template literals', () => {
    const code = `
      const foo = \`<!-- bar --> \${'<!-- baz -->'} \${qux}\`;
    `;

    const processedCode = postProcessAST(code);
    expect(processedCode).toMatchInlineSnapshot(
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

    const processedCode = postProcessAST(code);
    expect(processedCode).toMatchInlineSnapshot(`
      "const foo = \`foo bar \${\\"import\\"}\${\\"()\\"} baz\`;
      const bar = \`foo bar \${\\"import\\"}\${\\"(this works too)\\"} baz\`;
      foo\`
              foo \${\\"import\\"}\${\\"()\\"} \${\\"import\\" + \\"(bar)\\"} \${qux}      \`;"
    `);
  });

  it('breaks up HTML comment terminators in comments', () => {
    const code = `
      // <!-- foo -->
    `;

    const processedCode = postProcessAST(code);
    expect(processedCode).toMatchInlineSnapshot(`"// < !-- foo -- >"`);
  });

  it('breaks up `import()` in comments', () => {
    const code = `
      // Foo bar import() baz
      // Foo bar import(baz) qux
    `;

    const processedCode = postProcessAST(code);
    expect(processedCode).toMatchInlineSnapshot(`
      "// Foo bar import\\\\() baz
      // Foo bar import\\\\(baz) qux"
    `);
  });

  it(`doesn't break on empty string literals`, () => {
    const code = `
      const foo = '';
    `;

    const processedCode = postProcessAST(code);
    expect(processedCode).toMatchInlineSnapshot(`"const foo = '';"`);
  });

  it(`doesn't process values that don't contain special tokens`, () => {
    const code = `
      const empty = '';
      const foo = 'foo';
      const bar = \`bar\${foo}\`;
    `;

    const processedCode = postProcessAST(code);
    expect(processedCode).toMatchInlineSnapshot(`
      "const empty = '';
      const foo = 'foo';
      const bar = \`bar\${foo}\`;"
    `);
  });

  it(`doesn't break template literals with special characters`, () => {
    // eslint-disable-next-line
    const code = 'const foo = `<!-- \\` ${foo} \\` -->`;';

    const processedCode = postProcessAST(code);
    expect(processedCode).toMatchInlineSnapshot(
      `"const foo = \`\${\\"<!\\"}\${\\"--\\"} \\\\\` \${foo} \\\\\` \${\\"--\\"}\${\\">\\"}\`;"`,
    );
  });

  it.each(['const a = b <!-- c;', 'const a = b --> c;'])(
    'throws an error when HTML comment tokens are used as operators',
    (code) => {
      expect(() => postProcessAST(code)).toThrow(
        'Using HTML comments (`<!--` and `-->`) as operators is not allowed.',
      );
    },
  );

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

    const processedCode = postProcessAST(code, false);
    expect(processedCode).toMatchInlineSnapshot(`
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

  it('forwards parser errors', () => {
    // Invalid code
    const code = `const`;

    expect(() => postProcessAST(code)).toThrow(`Failed to post process code`);
  });
});
