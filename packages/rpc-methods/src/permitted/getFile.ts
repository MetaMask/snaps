import type {
  PermittedHandlerExport,
  PendingJsonRpcResponse,
  JsonRpcEngineEndCallback,
  JsonRpcRequest,
} from '@metamask/types';
import { assertStruct, type Hex } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import type { Infer } from 'superstruct';
import { object, string } from 'superstruct';

import type { MethodHooksObject } from '../utils';

export const GetFileArgsStruct = object({
  path: string(),
});

export type GetFileArgs = Infer<typeof GetFileArgsStruct>;

const hookNames: MethodHooksObject<GetFileHooks> = {
  getSnapFile: true,
};

export const getFileHandler: PermittedHandlerExport<
  GetFileHooks,
  JsonRpcRequest<unknown>,
  unknown
> = {
  methodNames: ['snap_getFile'],
  implementation,
  hookNames,
};

export type GetFileHooks = {
  getSnapFile: (path: string) => Promise<Hex>;
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
  req: JsonRpcRequest<unknown>,
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
    res.result = await getSnapFile(params.path);
  } catch (error) {
    return end(error);
  }

  return end();
}
