import { enumValue, AuxiliaryFileEncoding } from '@metamask/snaps-utils';
import type {
  PermittedHandlerExport,
  PendingJsonRpcResponse,
  JsonRpcEngineEndCallback,
  JsonRpcRequest,
} from '@metamask/types';
import { assertStruct } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import type { Infer } from 'superstruct';
import { object, optional, string, union } from 'superstruct';

import type { MethodHooksObject } from '../utils';

export const GetFileArgsStruct = object({
  path: string(),
  encoding: optional(
    union([
      enumValue(AuxiliaryFileEncoding.Base64),
      enumValue(AuxiliaryFileEncoding.Hex),
    ]),
  ),
});

export type GetFileArgs = Infer<typeof GetFileArgsStruct>;

const hookNames: MethodHooksObject<GetFileHooks> = {
  getSnapFile: true,
};

export const getFileHandler: PermittedHandlerExport<
  GetFileHooks,
  GetFileArgs,
  string
> = {
  methodNames: ['snap_getFile'],
  implementation,
  hookNames,
};

export type GetFileHooks = {
  getSnapFile: (
    path: GetFileArgs['path'],
    encoding: GetFileArgs['encoding'],
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
 * @param hooks.getSnapFile - The funnction to load a static snap file.
 * @returns Nothing.
 */
async function implementation(
  req: JsonRpcRequest<GetFileArgs>,
  res: PendingJsonRpcResponse<unknown>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getSnapFile }: GetFileHooks,
): Promise<void> {
  const { params } = req;

  assertStruct(
    params,
    GetFileArgsStruct,
    'Invalid "snap_getFile" parameters',
    ethErrors.rpc.invalidParams,
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
