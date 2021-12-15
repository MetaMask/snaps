import { errorCodes, ethErrors, EthereumRpcError } from 'eth-rpc-errors';

type UnauthorizedArg = {
  data?: Record<string, unknown>;
};

export function unauthorized(opts: UnauthorizedArg) {
  return ethErrors.provider.unauthorized({
    message:
      'Unauthorized to perform action. Try requesting the required permission(s) first. For more information, see: https://docs.metamask.io/guide/rpc-api.html#permissions',
    data: opts.data,
  });
}

export function methodNotFound(method: string, data?: unknown) {
  const message = `The method "${method}" does not exist / is not available.`;

  const opts: Parameters<typeof ethErrors.rpc.methodNotFound>[0] = { message };
  if (data !== undefined) {
    opts.data = data;
  }
  return ethErrors.rpc.methodNotFound(opts);
}

type InvalidParamsArg = {
  message?: string;
  data?: unknown;
};

export function invalidParams(opts: InvalidParamsArg) {
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

export class EndowmentPermissionDoesNotExistError extends Error {
  public data?: { origin: string };

  constructor(target: string, origin?: string) {
    super(`Subject "${origin}" has no permission for "${target}".`);
    if (origin) {
      this.data = { origin };
    }
  }
}

export class UnrecognizedCaveatTypeError extends Error {
  public data: {
    caveatType: string;
    origin?: string;
    target?: string;
  };

  constructor(caveatType: string);

  constructor(caveatType: string, origin: string, target: string);

  constructor(caveatType: string, origin?: string, target?: string) {
    super(`Unrecognized caveat type: "${caveatType}"`);
    this.data = { caveatType };
    if (origin !== undefined) {
      this.data.origin = origin;
    }

    if (target !== undefined) {
      this.data.target = target;
    }
  }
}

export class InvalidCaveatsPropertyError extends Error {
  public data: { origin: string; target: string; caveatsProperty: unknown };

  constructor(origin: string, target: string, caveatsProperty: unknown) {
    super(
      `The "caveats" property of permission for "${target}" of subject "${origin}" is invalid. It must be a non-empty array if specified.`,
    );
    this.data = { origin, target, caveatsProperty };
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

export class CaveatInvalidJsonError extends Error {
  public data: {
    caveat: Record<string, unknown>;
    origin: string;
    target: string;
  };

  constructor(caveat: Record<string, unknown>, origin: string, target: string) {
    super(`Caveat "value" is invalid JSON.`);
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

export class ForbiddenCaveatError extends Error {
  public data: {
    caveatType: string;
    origin: string;
    target: string;
  };

  constructor(caveatType: string, origin: string, targetName: string) {
    super(
      `Permissions for target "${targetName}" may not have caveats of type "${caveatType}".`,
    );
    this.data = { caveatType, origin, target: targetName };
  }
}

export class DuplicateCaveatError extends Error {
  public data: {
    caveatType: string;
    origin: string;
    target: string;
  };

  constructor(caveatType: string, origin: string, targetName: string) {
    super(
      `Permissions for target "${targetName}" contains multiple caveats of type "${caveatType}".`,
    );
    this.data = { caveatType, origin, target: targetName };
  }
}

export class PermissionsRequestNotFoundError extends Error {
  constructor(id: string) {
    super(`Permissions request with id "${id}" not found.`);
  }
}
