/**
 * Write text to `stdout`, and wait for it to finish.
 *
 * @param text - The text to write.
 * @returns A promise that resolves when the text has been written.
 */
export async function write(text: string): Promise<void> {
  if (typeof process === 'undefined' || !process.stdout) {
    throw new Error('Cannot write to `stdout` in this environment.');
  }

  return await new Promise((resolve, reject) => {
    process.stdout.write(text, (error) => {
      if (error) {
        return reject(error);
      }

      return resolve();
    });
  });
}
