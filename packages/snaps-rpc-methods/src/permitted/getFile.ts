import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type { GetFileParams, GetFileResult } from '@metamask/snaps-sdk';
import { AuxiliaryFileEncoding, enumValue } from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import { object, optional, string, union } from '@metamask/superstruct';
import type { PendingJsonRpcResponse, JsonRpcRequest } from '@metamask/utils';
import { assertStruct } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

export const GetFileArgsStruct = object({
  path: string(),
  encoding: optional(
    union([
      enumValue(AuxiliaryFileEncoding.Base64),
      enumValue(AuxiliaryFileEncoding.Hex),
      enumValue(AuxiliaryFileEncoding.Utf8),
    ]),
  ),
});

export type InferredGetFileParams = InferMatching<
  typeof GetFileArgsStruct,
  GetFileParams
>;

const methodName = 'snap_getFile';

const hookNames: MethodHooksObject<GetFileHooks> = {
  getSnapFile: true,
};

/**
 * Gets a static file's content in UTF-8, Base64, or hexadecimal.
 *
 * The file must be specified in [the Snap's manifest file](https://docs.metamask.io/snaps/features/static-files/).
 *
 * @example
 * ```json name="Manifest"
 * {
 *   "source": {
 *     "files": ["./files/my-file.bin"]
 *   }
 * }
 * ```
 * ```ts name="Usage"
 * const contents = await snap.request({
 *   method: 'snap_getFile',
 *   params: {
 *     path: './files/myfile.bin',
 *     encoding: 'hex',
 *   },
 * })
 *
 * // '0x...'
 * console.log(contents)
 * ```
 */
export const getFileHandler = {
  methodNames: [methodName] as const,
  implementation,
  hookNames,
} satisfies PermittedHandlerExport<GetFileHooks, InferredGetFileParams, string>;

export type GetFileHooks = {
  getSnapFile: (
    path: InferredGetFileParams['path'],
    encoding: InferredGetFileParams['encoding'],
  ) => Promise<string>;
};

/**
 * The `snap_getFile` method implementation.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.getSnapFile - The function to load a static snap file.
 * @returns Nothing.
 */
async function implementation(
  req: JsonRpcRequest<InferredGetFileParams>,
  res: PendingJsonRpcResponse<GetFileResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getSnapFile }: GetFileHooks,
): Promise<void> {
  const { params } = req;

  assertStruct(
    params,
    GetFileArgsStruct,
    'Invalid "snap_getFile" parameters',
    rpcErrors.invalidParams,
  );

  try {
    res.result = await getSnapFile(
      params.path,
      params.encoding ?? AuxiliaryFileEncoding.Base64,
    );
  } catch (error) {
    return end(error);
  }

  return end();
}
