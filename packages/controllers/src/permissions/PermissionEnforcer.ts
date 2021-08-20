import { nanoid } from 'nanoid';
import {
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback,
  JsonRpcRequest,
  PendingJsonRpcResponse,
  JsonRpcEngineCallbackError,
} from 'json-rpc-engine';
import { CaveatSpecifications, decorateWithCaveats } from './caveat-processing';
import { methodNotFound, unauthorized } from './errors';
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

  executeRestrictedMethod<Params, Result>(
    origin: string,
    method: string,
    params: Params,
  ): Promise<Result> {
    return new Promise<Result>((resolve) => {
      const id = nanoid();
      const req: JsonRpcRequest<Params> = { id, jsonrpc: '2.0', method };
      if (params !== undefined) {
        req.params = params;
      }

      const res: PendingJsonRpcResponse<Result> = { id, jsonrpc: '2.0' };

      // no-op
      const next = () => undefined;

      const end = (error?: JsonRpcEngineCallbackError) => {
        if (error || res.error) {
          throw error || res.error;
        } else if (res.result === undefined) {
          throw new Error(
            `Internal request for method "${method}" as origin "${origin}" has no result.`,
          );
        } else {
          resolve(res.result);
        }
      };

      const methodImplementation = this.getRestrictedMethodImplementation(
        method,
        req,
      );

      this._executeRestrictedMethod(
        methodImplementation,
        { origin },
        req,
        res,
        next,
        end,
      );
    });
  }

  getPermissionsMiddleware() {
    const permissionsMiddleware = (
      req: JsonRpcRequest<unknown>,
      res: PendingJsonRpcResponse<unknown>,
      next: JsonRpcEngineNextCallback,
      end: JsonRpcEngineEndCallback,
      subject: SubjectMetadata,
    ): void => {
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

      const permission = this.getPermission(subject.origin, method);
      if (!permission) {
        return end(unauthorized({ data: { request: req } }));
      }

      this._executeRestrictedMethod(
        methodImplementation,
        subject,
        req,
        res,
        next,
        end,
      );
      return undefined;
    };
    return permissionsMiddleware;
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
    request: JsonRpcRequest<unknown>,
  ): RestrictedMethodImplementation<unknown, unknown> {
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
   * @param subject
   * @param req
   * @param res
   * @param next
   * @param end
   * @returns
   */
  private _executeRestrictedMethod(
    methodImplementation: RestrictedMethodImplementation<unknown, unknown>,
    subject: SubjectMetadata,
    req: JsonRpcRequest<unknown>,
    res: PendingJsonRpcResponse<unknown>,
    next: JsonRpcEngineNextCallback,
    end: JsonRpcEngineEndCallback,
  ): void | Promise<void> {
    const { origin } = subject;
    const { method } = req;

    const permission = this.getPermission(origin, method);
    if (!permission) {
      throw unauthorized({ data: { origin, method } });
    }

    return decorateWithCaveats(
      methodImplementation,
      permission,
      this.caveatSpecifications,
    )(req, res, next, end, { origin });
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
