import { JsonRpcId, JsonRpcParams, JsonStruct } from '@metamask/utils';
import { array, Infer, object, string, union } from 'superstruct';

/* eslint-disable @typescript-eslint/consistent-type-definitions */
declare module 'expect' {
  interface AsymmetricMatchers {
    toRespondWith(response: unknown): void;
    toRespondWithError(error: unknown): void;
    toSendNotification(message: string): void;
  }

  // Ideally we would use `Matchers<Result>` instead of `Matchers<R>`, but
  // TypeScript doesn't allow this:
  // TS2428: All declarations of 'Matchers' must have identical type parameters.
  interface Matchers<R> {
    toRespondWith(response: unknown): R;
    toRespondWithError(error: unknown): R;
    toSendNotification(message: string): R;
  }
}
/* eslint-enable @typescript-eslint/consistent-type-definitions */

export type RequestOptions = {
  /**
   * The JSON-RPC request ID.
   */
  id?: JsonRpcId;

  /**
   * The JSON-RPC method.
   */
  method: string;

  /**
   * The JSON-RPC params.
   */
  params?: JsonRpcParams;

  /**
   * The origin to send the request from.
   */
  origin?: string;
};

export type Snap = {
  request(request: RequestOptions): Promise<SnapResponse>;
};

export const SnapResponseStruct = object({
  id: string(),
  response: union([
    object({
      result: JsonStruct,
    }),
    object({
      error: JsonStruct,
    }),
  ]),
  notifications: array(
    object({
      id: string(),
      message: string(),
    }),
  ),
});

export type SnapResponse = Infer<typeof SnapResponseStruct>;
