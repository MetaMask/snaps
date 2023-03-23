import { stringToBytes, bytesToString } from '@metamask/utils';
import { base64 } from '@scure/base';

/**
 * Encode a value to base64.
 *
 * @param value - The value to encode.
 * @returns The encoded value.
 */
function encodeBase64(value: string): string {
  return base64.encode(stringToBytes(value));
}

/**
 * Decode a value from base64.
 *
 * @param value - The value to decode.
 * @returns The decoded value.
 */
function decodeBase64(value: string): string {
  return bytesToString(base64.decode(value));
}

/**
 * Creates `atob` and `btoa` functions hardened by SES.
 *
 * @returns An object with the attenuated `atob` and `btoa` functions.
 */
const createBase64 = () => {
  return {
    atob: harden(decodeBase64),
    btoa: harden(encodeBase64),
  } as const;
};

const endowmentModule = {
  names: ['atob', 'btoa'] as const,
  factory: createBase64,
};
export default endowmentModule;
