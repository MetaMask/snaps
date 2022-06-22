import { getAST, getCode, postProcessAST } from './ast';

describe('getAST', () => {
  it('returns an AST for the provided code', () => {
    const code = `const foo = 'bar'; console.log(foo);`;

    // eslint-disable-next-line jest/no-restricted-matchers
    expect(getAST(code)).toMatchSnapshot();
  });

  it('forwards parser errors', () => {
    // Invalid code
    const code = `const foo bar;`;

    expect(() => getAST(code)).toThrow(
      `'Const declarations' require an initialization value.`,
    );
  });
});

describe('postProcessAST', () => {
  it('strips comments', () => {
    const code = `
      // This is a comment
      const foo = 'bar';
    `;

    const ast = getAST(code);
    const processedCode = postProcessAST(ast, { stripComments: true });

    expect(getCode(processedCode)).toMatchInlineSnapshot(
      `"const foo = 'bar';"`,
    );
  });

  it('wraps eval', () => {
    const code = `
      eval(bar);
      foo.eval(bar, baz);
      foo.bar.eval(baz, qux);
    `;

    const ast = getAST(code);
    const processedCode = postProcessAST(ast);

    expect(getCode(processedCode)).toMatchInlineSnapshot(`
      "(1, eval)(bar);
      (1, foo.eval)(bar, baz);
      (1, foo.bar.eval)(baz, qux);"
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
      regeneratorRuntime.foo();
      regeneratorRuntime.bar();
    `;

    const ast = getAST(code);
    const processedCode = postProcessAST(ast);

    expect(getCode(processedCode)).toMatchInlineSnapshot(`
      "var regeneratorRuntime;
      regeneratorRuntime.foo();
      regeneratorRuntime.bar();"
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

  it('breaks up HTML comment terminators in string literals', () => {
    const code = `
      const foo = '<!-- bar -->';
    `;

    const ast = getAST(code);
    const processedCode = postProcessAST(ast, { stripComments: false });

    expect(getCode(processedCode)).toMatchInlineSnapshot(
      `"const foo = \\"<!\\" + \\"--\\" + \\" bar \\" + \\"--\\" + \\">\\";"`,
    );
  });

  it('breaks up HTML comment terminators in comments', () => {
    const code = `
      <!-- foo -->
    `;

    const ast = getAST(code);
    const processedCode = postProcessAST(ast, { stripComments: false });

    expect(getCode(processedCode)).toMatchInlineSnapshot(`"// foo -- >"`);
  });

  it('processes all the things', () => {
    const code = `
      (function (Buffer, foo) {
        // Sets 'bar' to 'baz'
        const bar = '<!-- baz -->';
        eval(foo);
        foo.eval('bar');

        regeneratorRuntime.foo();
      });
    `;

    const ast = getAST(code);
    const processedCode = postProcessAST(ast);

    expect(getCode(processedCode)).toMatchInlineSnapshot(`
      "(function (foo) {
        var regeneratorRuntime;
        const bar = \\"<!\\" + \\"--\\" + \\" baz \\" + \\"--\\" + \\">\\";
        (1, eval)(foo);
        (1, foo.eval)('bar');
        regeneratorRuntime.foo();
      });"
    `);
  });
});
