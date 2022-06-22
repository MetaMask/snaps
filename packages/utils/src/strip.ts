import { parse } from '@babel/parser';
import generate from '@babel/generator';

/**
 * Strips comments from source code.
 *
 * @param code - Source code to strip comments from.
 * @returns Source code without comments.
 */
export function stripComments(code: string): string {
  const ast = parse(code, { attachComment: false }) as any;

  const output = generate(ast, {}, code);
  return output.code;
}
