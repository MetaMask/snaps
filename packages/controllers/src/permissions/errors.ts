import { JsonRpcRequest } from 'json-rpc-engine';
import { errorCodes, ethErrors, EthereumRpcError } from 'eth-rpc-errors';

type ErrorArg = {
  message?: string;
  data?: JsonRpcRequest<unknown> | unknown;
};

type MethodNotFoundArg = ErrorArg & {
  method?: string;
};

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
    ? `The method "${opts.method}" does not exist / is not available.`
    : undefined;

  return ethErrors.rpc.methodNotFound({ data: opts.data, message });
}

export function invalidParams(opts: ErrorArg) {
  return ethErrors.rpc.invalidParams({
    data: opts.data,
    message: opts.message,
  });
}

export function userRejectedRequest<Data extends Record<string, unknown>>(
  data?: Data,
): EthereumRpcError<Data> {
  return ethErrors.provider.userRejectedRequest({ data });
}

export function internalError<Data extends Record<string, unknown>>(
  message: string,
  data?: Data,
): EthereumRpcError<Data> {
  return ethErrors.rpc.internal({ message, data });
}

export class InvalidSubjectIdentifierError extends Error {
  constructor(origin: unknown) {
    super(
      `Invalid subject identifier: "${
        typeof origin === 'string' ? origin : typeof origin
      }"`,
    );
  }
}

export class UnrecognizedSubjectError extends Error {
  constructor(origin: string) {
    super(`Unrecognized subject: "${origin}" has no permissions.`);
  }
}

export class InvalidApprovedPermissionError extends Error {
  public data: {
    origin: string;
    target: string;
    approvedPermission: Record<string, unknown>;
  };

  constructor(
    origin: string,
    target: string,
    approvedPermission: Record<string, unknown>,
  ) {
    super(
      `Invalid approved permission for origin "${origin}" and target "${target}".`,
    );
    this.data = { origin, target, approvedPermission };
  }
}

export class PermissionDoesNotExistError extends Error {
  constructor(origin: string, target: string) {
    super(`Subject "${origin}" has no permission for "${target}".`);
  }
}

export class UnrecognizedCaveatTypeError extends Error {
  constructor(caveatType: string) {
    super(`Unrecognized caveat type: "${caveatType}"`);
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

export class InvalidCaveatError extends EthereumRpcError<unknown> {
  public data: { origin: string; target: string };

  constructor(receivedCaveat: unknown, origin: string, target: string) {
    super(
      errorCodes.rpc.invalidParams,
      `Invalid caveat. Caveats must be plain objects.`,
      { receivedCaveat },
    );
    this.data = { origin, target };
  }
}

export class InvalidCaveatTypeError extends Error {
  public data: {
    caveat: Record<string, unknown>;
    origin: string;
    target: string;
  };

  constructor(caveat: Record<string, unknown>, origin: string, target: string) {
    super(`Caveat types must be strings. Received: "${typeof caveat.type}"`);
    this.data = { caveat, origin, target };
  }
}

export class CaveatTypeDoesNotExistError extends Error {
  public data: {
    caveat: Record<string, unknown>;
    origin: string;
    target: string;
  };

  constructor(caveat: Record<string, unknown>, origin: string, target: string) {
    super(`Caveat type "${caveat.type}" does not exist.`);
    this.data = { caveat, origin, target };
  }
}

export class CaveatMissingValueError extends Error {
  public data: {
    caveat: Record<string, unknown>;
    origin: string;
    target: string;
  };

  constructor(caveat: Record<string, unknown>, origin: string, target: string) {
    super(`Caveat is missing "value" field.`);
    this.data = { caveat, origin, target };
  }
}

export class InvalidCaveatFieldsError extends Error {
  public data: {
    caveat: Record<string, unknown>;
    origin: string;
    target: string;
  };

  constructor(caveat: Record<string, unknown>, origin: string, target: string) {
    super(
      `Caveat has unexpected number of fields: "${Object.keys(caveat).length}"`,
    );
    this.data = { caveat, origin, target };
  }
}
