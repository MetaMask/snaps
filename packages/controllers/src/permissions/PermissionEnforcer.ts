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
import {
  internalError,
  invalidParams,
  methodNotFound,
  unauthorized,
} from './errors';
import type { Permission, RequestedPermissions } from './Permission';
import type {
  PermissionController,
  PermissionsRequest,
  RestrictedMethodImplementation,
  SubjectMetadata,
} from './PermissionController';
import type { ApprovalController } from './temp/ApprovalController';

type IsRestrictedMethod = (method: string) => boolean;
type IsSafeMethod = (method: string) => boolean;
type RequestUserApproval = (
  permissionsRequest: PermissionsRequest,
) => Promise<RequestedPermissions>;

type PermissionEnforcerArgs = {
  caveatSpecifications: CaveatSpecifications;
  isRestrictedMethod: IsRestrictedMethod;
  isSafeMethod: IsSafeMethod;
  getPermission: PermissionController['getPermission'];
  getRestrictedMethodImplementation: PermissionController['getRestrictedMethodImplementation'];
  grantPermissions: PermissionController['grantPermissions'];
  requestUserApproval: RequestUserApproval;
};

class PermissionEnforcer {
  private caveatSpecifications: CaveatSpecifications;

  private isRestrictedMethod: IsRestrictedMethod;

  private isSafeMethod: IsSafeMethod;

  private getPermission: PermissionController['getPermission'];

  private grantPermissions: PermissionController['grantPermissions'];

  private requestUserApproval: RequestUserApproval;

  private _getRestrictedMethodImplementation: PermissionController['getRestrictedMethodImplementation'];

  constructor({
    caveatSpecifications,
    isRestrictedMethod,
    isSafeMethod,
    getPermission,
    getRestrictedMethodImplementation,
    grantPermissions,
    requestUserApproval,
  }: PermissionEnforcerArgs) {
    this.caveatSpecifications = caveatSpecifications;
    this.isRestrictedMethod = isRestrictedMethod;
    this.isSafeMethod = isSafeMethod;
    this.getPermission = getPermission;
    this.grantPermissions = grantPermissions;
    this.requestUserApproval = requestUserApproval;
    this._getRestrictedMethodImplementation = getRestrictedMethodImplementation;
  }

  async executeRestrictedMethod(
    origin: string,
    method: string,
    params: Json,
  ): Promise<Json> {
    const id = nanoid();
    const req: JsonRpcRequest<Json> = { id, jsonrpc: '2.0', method };
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

    return result;
  }

  async requestPermissions(
    origin: string,
    requestedPermissions: RequestedPermissions,
    id: string = nanoid(),
  ): Promise<[Record<string, Permission>, { id: string; origin: string }]> {
    this.validateRequestedPermissions(origin, requestedPermissions);
    const metadata: PermissionsRequest['metadata'] = {
      id,
      origin,
    };

    const permissionsRequest: PermissionsRequest = {
      metadata,
      permissions: requestedPermissions,
    };

    const approved = await this.requestUserApproval(permissionsRequest);
    if (Object.keys(approved).length === 0) {
      throw internalError(
        `Approved permissions request for origin "${origin}" contains no permissions.`,
        { requestedPermissions },
      );
    }

    return [this.grantPermissions({ origin }, approved), metadata];
  }

  private validateRequestedPermissions(
    origin: string,
    requestedPermissions: RequestedPermissions,
  ) {
    if (
      !requestedPermissions ||
      typeof requestedPermissions !== 'object' ||
      Array.isArray(requestedPermissions)
    ) {
      throw invalidParams({ data: { origin, requestedPermissions } });
    }

    const perms: RequestedPermissions = requestedPermissions;

    for (const methodName of Object.keys(perms)) {
      const target =
        perms[methodName].target ||
        (perms[methodName] as unknown as Permission).parentCapability;
      if (target !== undefined && methodName !== target) {
        throw invalidParams({ data: { origin, requestedPermissions } });
      }

      if (!this.isRestrictedMethod(methodName)) {
        throw methodNotFound({
          method: methodName,
          data: { origin, requestedPermissions },
        });
      }
    }
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
          { request: req },
        );
        return undefined;
      }

      res.result = result;
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
  ): ReturnType<RestrictedMethodImplementation<Json, Json>> {
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
  permissionController: PermissionController,
  addAndShowApprovalRequest: ApprovalController['addAndShowApprovalRequest'],
): PermissionEnforcer {
  return new PermissionEnforcer({
    caveatSpecifications: permissionController.caveatSpecifications,
    isRestrictedMethod: (method: string) => {
      return Boolean(permissionController.getMethodKeyFor(method));
    },
    isSafeMethod: (method: string) => {
      return permissionController.safeMethods.has(method);
    },
    getPermission:
      permissionController.getPermission.bind(permissionController),
    getRestrictedMethodImplementation:
      permissionController.getRestrictedMethodImplementation.bind(
        permissionController,
      ),
    grantPermissions:
      permissionController.grantPermissions.bind(permissionController),
    requestUserApproval: async (permissionsRequest: PermissionsRequest) => {
      const { origin, id } = permissionsRequest.metadata;
      return (await addAndShowApprovalRequest({
        id,
        origin,
        requestData: permissionsRequest,
        type: 'wallet_requestPermissions', // TODO: Establish enum somehow
      })) as RequestedPermissions;
    },
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
