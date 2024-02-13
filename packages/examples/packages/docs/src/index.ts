import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import { getMethodHandler } from '@metamask/snaps-sdk';
import {
  bytesToHex,
  hexToBytes,
  isPlainObject,
  stringToBytes,
} from '@metamask/utils';
import { getPublicKey, sign, utils, verify } from '@noble/secp256k1';
import { boolean, object, optional, string } from 'superstruct';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method.
 *
 * This Snap uses the `getMethodHandler` utility to create a handler for each
 * supported method. The handler is an async function that receives the request
 * parameters and returns the response. The `getMethodHandler` utility also
 * validates the request parameters against a schema, and makes it possible to
 * extract the documentation for each method using the Snaps CLI.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 */
export const onRpcRequest: OnRpcRequestHandler = getMethodHandler({
  getPublicKey: {
    // This method uses the `superstruct` library to validate the request
    // parameters against a schema. You can also use a function to validate the
    // parameters, or omit the schema to skip validation.
    schema: object({
      compressed: optional(boolean()),
    }),

    /**
     * Get the public key for Snap. This uses the `snap_getEntropy` method to
     * get deterministic entropy, and derives the public key from the entropy.
     *
     * @param params - The request parameters.
     * @param params.compressed - Whether to return the compressed public key.
     * @returns The public key as a hexadecimal string.
     * @example
     * const snap = await installSnap('@metamask/docs-example-snap');
     * const publicKey = await snap.getPublicKey({ compressed: true });
     */
    handler: async ({ compressed }) => {
      const entropy = await snap.request({
        method: 'snap_getEntropy',
        params: {
          version: 1,
        },
      });

      const privateKey = hexToBytes(entropy);
      const publicKey = getPublicKey(privateKey, compressed);

      return bytesToHex(publicKey);
    },
  },

  signMessage: {
    // This method uses a function to validate the request parameters. You can
    // also use the `superstruct` library to validate the parameters against a
    // schema, or omit the schema to skip validation.
    schema: (params: unknown): params is { message: string } => {
      return isPlainObject(params) && typeof params.message === 'string';
    },

    /**
     * Sign a message. This uses the `snap_getEntropy` method to get
     * deterministic entropy, and derives the private key from the entropy. The
     * message is hashed using SHA-256, and the hash is signed using the
     * private key.
     *
     * @param params - The request parameters.
     * @param params.message - The message to sign.
     * @returns The signature as a hexadecimal string.
     * @example
     * const snap = await installSnap('@metamask/docs-example-snap');
     * const signature = await snap.signMessage({ message: 'Hello, world!' });
     */
    handler: async ({ message }) => {
      const entropy = await snap.request({
        method: 'snap_getEntropy',
        params: {
          version: 1,
        },
      });

      const hash = await utils.sha256(stringToBytes(message));
      const privateKey = hexToBytes(entropy);
      const bytes = await sign(hash, privateKey);

      return bytesToHex(bytes);
    },
  },

  verifyMessage: {
    schema: object({
      message: string(),
      signature: string(),
    }),

    /**
     * Verify a message signature. This uses the `snap_getEntropy` method to get
     * deterministic entropy, and derives the public key from the entropy. The
     * message is hashed using SHA-256, and the hash is verified using the
     * public key.
     *
     * @param params - The request parameters.
     * @param params.message - The message to verify.
     * @param params.signature - The signature to verify.
     * @returns Whether the signature is valid.
     * @example
     * const snap = await installSnap('@metamask/docs-example-snap');
     * const valid = await snap.verifyMessage({
     *   message: 'Hello, world!',
     *   signature: '...',
     * });
     */
    handler: async ({ message, signature }) => {
      const entropy = await snap.request({
        method: 'snap_getEntropy',
        params: {
          version: 1,
        },
      });

      const privateKey = hexToBytes(entropy);
      const publicKey = getPublicKey(privateKey);

      const hash = await utils.sha256(stringToBytes(message));
      const signatureBytes = hexToBytes(signature);

      return verify(signatureBytes, hash, publicKey);
    },
  },
});
