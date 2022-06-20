import { parse } from '@babel/parser';
import generate from '@babel/generator';

export function stripComments(code: string) {
  const ast = parse(code, { attachComment: false }) as any;

  const output = generate(
    ast,
    {
      comments: false,
    },
    code,
  );
  return output.code;
}
