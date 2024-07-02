import { getSourceCode } from './docs';

describe('getSourceCode', () => {
  it('returns the JSX source code from a Storybook story', async () => {
    const code = `
      {
        render: props => <Foo {...props} />,
        args: {
          bar: 'baz',
          children: <Qux />,
        }
      }
    `;

    expect(getSourceCode(code)).toMatchInlineSnapshot(`
      "<Foo bar="baz">
        <Qux />
      </Foo>
      "
    `);
  });
});
