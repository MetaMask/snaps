import { JsonRpcRequest } from 'json-rpc-engine';
import { ethErrors, EthereumRpcError } from 'eth-rpc-errors';

interface ErrorArg {
  message?: string;
  data?: JsonRpcRequest<unknown> | unknown;
}

interface MethodNotFoundArg extends ErrorArg {
  methodName?: string;
}

export function unauthorized(arg?: ErrorArg) {
  return ethErrors.provider.unauthorized({
    message:
      arg?.message ||
      'Unauthorized to perform action. Try requesting the required permission(s) first. For more information, see: https://docs.metamask.io/guide/rpc-api.html#permissions',
    data: arg?.data || undefined,
  });
}

export function methodNotFound(opts: MethodNotFoundArg) {
  const message = opts.methodName
    ? `The method '${opts.methodName}' does not exist / is not available.`
    : undefined;

  return ethErrors.rpc.methodNotFound({ data: opts.data, message });
}

export function userRejectedRequest(
  request?: JsonRpcRequest<unknown>,
): EthereumRpcError<JsonRpcRequest<unknown>> {
  return ethErrors.provider.userRejectedRequest({ data: request });
}
