/**
 * Mocks encrypting a value using a password. This is not a real encryption
 * method, but rather is used to simulate encryption in the tests.
 *
 * Ideally we would use a real encryption method, such as
 * `@metamask/browser-passworder`, but it doesn't seem to work with Node.js 18
 * without some mocking. We can switch to a real encryption method once we
 * drop support for Node.js 18.
 *
 * @param password - The password to use.
 * @param value - The value to encrypt.
 * @returns The "encrypted" value.
 */
export function encryptImplementation(password: string, value: string) {
  return `${password}:${JSON.stringify(value)}`;
}

/**
 * Mocks decrypting a value using a password. This is not a real encryption
 * method, but rather is used to simulate encryption in the tests.
 *
 * Ideally we would use a real decryption method, such as
 * `@metamask/browser-passworder`, but it doesn't seem to work with Node.js 18
 * without some mocking. We can switch to a real encryption method once we
 * drop support for Node.js 18.
 *
 * @param password - The password to use.
 * @param value - The value to decrypt.
 * @returns The "decrypted" value.
 */
export function decryptImplementation(password: string, value: string) {
  const [expectedPassword, expectedValue] = value.split(/:(.*)/u, 2);

  if (password !== expectedPassword) {
    throw new Error('Invalid password');
  }

  return JSON.parse(expectedValue);
}
