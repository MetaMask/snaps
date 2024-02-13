import { format } from 'prettier';

/**
 * Format code using Prettier.
 *
 * @param code - The code to format.
 * @returns The formatted code.
 */
export function formatCode(code: string) {
  return format(code, {
    parser: 'typescript',
    quoteProps: 'as-needed',
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'all',
  });
}
