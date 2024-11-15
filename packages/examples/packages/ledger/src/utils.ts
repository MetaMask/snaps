/**
 * Create a hexadecimal encoded signature from a signature object.
 *
 * @param signature - The signature object.
 * @param signature.r - The `r` value of the signature.
 * @param signature.s - The `s` value of the signature.
 * @param signature.v - The `v` value of the signature.
 * @returns The hexadecimal encoded signature.
 */
export function signatureToHex(signature: { r: string; s: string; v: number }) {
  const adjustedV = signature.v - 27;
  const hexV = adjustedV.toString(16).padStart(2, '0');

  return `0x${signature.r}${signature.s}${hexV}`;
}
