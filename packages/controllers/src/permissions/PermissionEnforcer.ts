import { nanoid } from 'nanoid';
import {
  AsyncJsonRpcEngineNextCallback,
  createAsyncMiddleware,
  Json,
  JsonRpcRequest,
  JsonRpcMiddleware,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';
import { CaveatSpecifications, decorateWithCaveats } from './caveat-decoration';
import { internalError, methodNotFound, unauthorized } from './errors';
import type {
  PermissionController,
  RestrictedMethodImplementation,
  SubjectMetadata,
} from './PermissionController';

interface PermissionEnforcerArgs {
  caveatSpecifications: CaveatSpecifications;
  isSafeMethod: (method: string) => boolean;
  getPermission: PermissionController['getPermission'];
  getRestrictedMethodImplementation: PermissionController['getRestrictedMethodImplementation'];
}

class PermissionEnforcer {
  private isSafeMethod: (method: string) => boolean;

  private getPermission: PermissionController['getPermission'];

  private _getRestrictedMethodImplementation: PermissionController['getRestrictedMethodImplementation'];

  private caveatSpecifications: CaveatSpecifications;

  constructor({
    caveatSpecifications,
    isSafeMethod,
    getPermission,
    getRestrictedMethodImplementation,
  }: PermissionEnforcerArgs) {
    this.caveatSpecifications = caveatSpecifications;
    this.isSafeMethod = isSafeMethod;
    this.getPermission = getPermission;
    this._getRestrictedMethodImplementation = getRestrictedMethodImplementation;
  }

  async executeRestrictedMethod<Params extends Json, Result extends Json>(
    origin: string,
    method: string,
    params: Params,
  ): Promise<Result> {
    const id = nanoid();
    const req: JsonRpcRequest<Params> = { id, jsonrpc: '2.0', method };
    if (params !== undefined) {
      req.params = params;
    }

    const methodImplementation = this.getRestrictedMethodImplementation(
      method,
      req,
    );

    const result = await this._executeRestrictedMethod(
      methodImplementation,
      { origin },
      req,
    );

    if (resultIsError(result)) {
      throw result;
    }

    if (result === undefined) {
      throw new Error(
        `Internal request for method "${method}" as origin "${origin}" has no result.`,
      );
    }

    return result as Result;
  }

  getPermissionsMiddleware(
    subject: SubjectMetadata,
  ): JsonRpcMiddleware<Json, Json> {
    const permissionsMiddleware = async (
      req: JsonRpcRequest<Json>,
      res: PendingJsonRpcResponse<Json>,
      next: AsyncJsonRpcEngineNextCallback,
    ): Promise<void> => {
      const { method } = req;

      // skip registered safe/passthrough methods.
      if (this.isSafeMethod(method)) {
        return next();
      }

      // if the method also is not a restricted method, the method does not exist
      const methodImplementation = this.getRestrictedMethodImplementation(
        method,
        req,
      );

      const result = await this._executeRestrictedMethod(
        methodImplementation,
        subject,
        req,
      );

      if (resultIsError(result)) {
        res.error = result;
        return undefined;
      }

      if (result === undefined) {
        res.error = internalError(
          `Request for method "${req.method}" returned undefined result.`,
          req,
        );
        return undefined;
      }

      res.result = result as Json;
      return undefined;
    };

    return createAsyncMiddleware(permissionsMiddleware);
  }

  /**
   * Get the implementation of the given method.
   *
   * @param method - The name of the method whose implementation to retrieve.
   * @param request - The JSON-RPC request object calling the restricted method.
   * @returns The restricted method implementation, or throws an error if no
   * method exists.
   */
  private getRestrictedMethodImplementation(
    method: string,
    request: JsonRpcRequest<Json>,
  ): RestrictedMethodImplementation<Json, Json> {
    const methodImplementation =
      this._getRestrictedMethodImplementation(method);
    if (!methodImplementation) {
      throw methodNotFound({ method, data: { request } });
    }

    return methodImplementation;
  }

  /**
   * If called as a result of an RPC request, the existence of the method
   * should already be verified.
   *
   * @param methodImplementation - The implementation of the method to call.
   * @param subject - Metadata about the subject that made the request.
   * @param req - The request object associated with the request.
   * @returns
   */
  private _executeRestrictedMethod(
    methodImplementation: RestrictedMethodImplementation<Json, Json>,
    subject: SubjectMetadata,
    req: JsonRpcRequest<Json>,
  ): Json | Error | Promise<Json | Error> {
    const { origin } = subject;
    const { method } = req;

    const permission = this.getPermission(origin, method);
    if (!permission) {
      return unauthorized({ data: { origin, method } });
    }

    return decorateWithCaveats(
      methodImplementation,
      permission,
      this.caveatSpecifications,
    )(req, { origin });
  }
}

export type { PermissionEnforcer };

export function getPermissionEnforcer(
  controller: PermissionController,
): PermissionEnforcer {
  return new PermissionEnforcer({
    caveatSpecifications: controller.caveatSpecifications,
    isSafeMethod: (method: string) => {
      return controller.safeMethods.has(method);
    },
    getPermission: controller.getPermission.bind(controller),
    getRestrictedMethodImplementation:
      controller.getRestrictedMethodImplementation.bind(controller),
  });
}

function resultIsError(resultOrError: Json | Error): resultOrError is Error {
  return Boolean(
    resultOrError instanceof Error ||
      (resultOrError &&
        typeof resultOrError === 'object' &&
        'message' in resultOrError &&
        'code' in resultOrError),
  );
}
