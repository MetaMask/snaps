import {
  AsyncJsonRpcEngineNextCallback,
  createAsyncMiddleware,
  Json,
  JsonRpcRequest,
  JsonRpcMiddleware,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';
import { internalError } from './errors';
import {
  GenericPermission,
  PermissionSubjectMetadata,
  RestrictedMethod,
  RestrictedMethodParams,
  resultIsError,
} from '.';

type ExecuteRestrictedMethod<Permission extends GenericPermission> = (
  methodImplementation: RestrictedMethod<RestrictedMethodParams, Json>,
  subject: PermissionSubjectMetadata,
  method: Permission['parentCapability'],
  params?: RestrictedMethodParams,
) => ReturnType<RestrictedMethod<RestrictedMethodParams, Json>>;
type GetRestrictedMethod = (
  method: string,
  origin: string,
) => RestrictedMethod<RestrictedMethodParams, Json>;
type IsUnrestrictedMethod = (method: string) => boolean;

type PermissionMiddlewareFactoryOptions<Permission extends GenericPermission> =
  {
    executeRestrictedMethod: ExecuteRestrictedMethod<Permission>;
    getRestrictedMethod: GetRestrictedMethod;
    isUnrestrictedMethod: IsUnrestrictedMethod;
  };

export function getPermissionMiddlewareFactory<
  Permission extends GenericPermission,
>({
  executeRestrictedMethod,
  getRestrictedMethod,
  isUnrestrictedMethod,
}: PermissionMiddlewareFactoryOptions<Permission>) {
  return function createPermissionMiddleware(
    subject: PermissionSubjectMetadata,
  ): JsonRpcMiddleware<RestrictedMethodParams, Json> {
    const permissionsMiddleware = async (
      req: JsonRpcRequest<RestrictedMethodParams>,
      res: PendingJsonRpcResponse<Json>,
      next: AsyncJsonRpcEngineNextCallback,
    ): Promise<void> => {
      const { method, params } = req;

      // skip registered safe/passthrough methods.
      if (isUnrestrictedMethod(method)) {
        return next();
      }

      // This will throw if no restricted method implementation is found.
      const methodImplementation = getRestrictedMethod(method, subject.origin);

      const result = await executeRestrictedMethod(
        methodImplementation,
        subject,
        method as Permission['parentCapability'],
        params,
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
  };
}
