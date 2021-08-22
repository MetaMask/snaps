import { JsonRpcRequest } from 'json-rpc-engine';
import { ethErrors, EthereumRpcError } from 'eth-rpc-errors';
import { Permission } from './Permission';
import { Caveat } from './Caveat';

interface ErrorArg {
  message?: string;
  data?: JsonRpcRequest<unknown> | unknown;
}

interface MethodNotFoundArg extends ErrorArg {
  method?: string;
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
  const message = opts.method
    ? `The method '${opts.method}' does not exist / is not available.`
    : undefined;

  return ethErrors.rpc.methodNotFound({ data: opts.data, message });
}

export function userRejectedRequest(
  request?: JsonRpcRequest<unknown>,
): EthereumRpcError<JsonRpcRequest<unknown>> {
  return ethErrors.provider.userRejectedRequest({ data: request });
}

export function internalError(
  message: string,
  request?: JsonRpcRequest<unknown>,
): EthereumRpcError<JsonRpcRequest<unknown>> {
  return ethErrors.rpc.internal({ message, data: request });
}

export class InvalidSubjectIdentifierError extends Error {
  constructor(origin: string) {
    super(`Invalid subject identifier: ${origin}`);
  }
}

export class UnrecognizedSubjectError extends Error {
  constructor(origin: string) {
    super(`Unrecognized subject: "${origin}" has no permissions.`);
  }
}

export class PermissionDoesNotExistError extends Error {
  constructor(origin: string, target: string) {
    super(`Subject "${origin}" has no permission for "${target}".`);
  }
}

export class PermissionHasNoCaveatsError extends Error {
  constructor(origin: string, target: string) {
    super(`Permission for "${target}" of subject "${origin}" has no caveats.`);
  }
}

export class UnrecognizedCaveatTypeError extends Error {
  constructor(caveatType: string) {
    super(`Unrecognized caveat type: ${caveatType}`);
  }
}

export class CaveatDoesNotExistError extends Error {
  constructor(origin: string, target: string, caveatType: string) {
    super(
      `Permission for "${target}" of subject "${origin}" has no caveat of type "${caveatType}".`,
    );
  }
}

export class CaveatAlreadyExistsError extends Error {
  constructor(origin: string, target: string, caveatType: string) {
    super(
      `Permission for "${target}" of subject "${origin}" already has a caveat of type "${caveatType}".`,
    );
  }
}

export class InvalidPermissionJsonError extends Error {
  public data: { origin: string; permission: Permission };

  constructor(origin: string, permission: Permission) {
    super(`Permission object of subject "${origin}" is not valid JSON.`);
    this.data = { origin, permission };
  }
}

export class InvalidCaveatTypeError extends Error {
  constructor(caveatType: string) {
    super(`Caveat types must be strings. Received: ${typeof caveatType}`);
  }
}

export class CaveatTypeDoesNotExistError extends Error {
  public data: { origin: string; target: string };

  constructor(caveatType: string, origin: string, target: string) {
    super(`Caveat type "${caveatType}" does not exist.`);
    this.data = { origin, target };
  }
}

export class CaveatMissingValueError extends Error {
  public data: { caveat: Caveat<any>; origin: string; target: string };

  constructor(caveat: Caveat<any>, origin: string, target: string) {
    super(`Caveat is missing "value" field.`);
    this.data = { caveat, origin, target };
  }
}

export class InvalidCaveatFieldsError extends Error {
  public data: { caveat: Caveat<any>; origin: string; target: string };

  constructor(caveat: Caveat<any>, origin: string, target: string) {
    super(
      `Caveat has unexpected number of fields: ${Object.keys(caveat).length}`,
    );
    this.data = { caveat, origin, target };
  }
}

export class InvalidCaveatJsonError extends Error {
  public data: { caveat: Caveat<any>; origin: string; target: string };

  constructor(caveat: Caveat<any>, origin: string, target: string) {
    super(`Caveat object is not valid JSON.`);
    this.data = { caveat, origin, target };
  }
}
