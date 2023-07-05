/**
 * Indent a message by adding a number of spaces to the beginning of each line.
 *
 * @param message - The message to indent.
 * @param spaces - The number of spaces to indent by. Defaults to 2.
 * @returns The indented message.
 */
export function indent(message: string, spaces = 2) {
  return message.replace(/^/gmu, ' '.repeat(spaces));
}
