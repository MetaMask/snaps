import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
} from '@metamask/permission-controller';
import { PermittedHandlerExport } from '@metamask/types';

import { methodHandlers } from './permitted';
import { restrictedMethodPermissionBuilders } from './restricted';

/**
 * Get the method implementation from a {@link PermittedHandlerExport}.
 *
 * @template Handler - A permitted handler export.
 */
type PermittedMethodImplementation<Handler> =
  Handler extends PermittedHandlerExport<any, infer Args, infer Result>
    ? (args: Args) => Promise<Result>
    : never;

/**
 * Get a JSON-RPC method type from a {@link PermittedHandlerExport} and a method
 * name.
 *
 * @template MethodName - The name of the method.
 * @template Handler - A permitted handler export.
 */
type PermittedMethod<
  MethodName extends string,
  Handler,
> = PermittedMethodImplementation<Handler> extends (
  args: infer Args,
) => infer Return
  ? (args: { method: MethodName; params?: Args }) => Return
  : never;

/**
 * Get a restricted method implementation from a
 * {@link PermissionSpecificationBuilder}.
 *
 * @template Builder - A permission specification builder.
 */
type RestrictedMethodImplementation<Builder> = Builder extends {
  specificationBuilder: PermissionSpecificationBuilder<
    PermissionType.RestrictedMethod,
    any,
    infer Specification
  >;
}
  ? Specification['methodImplementation']
  : never;

/**
 * Get a JSON-RPC method type from a {@link PermissionSpecificationBuilder}.
 *
 * @template Builder - A permission specification builder.
 */
type RestrictedMethod<Builder extends { targetKey: string }> =
  RestrictedMethodImplementation<Builder> extends (
    args: infer Args,
  ) => infer Return
    ? Args extends RestrictedMethodOptions<infer Params>
      ? (args: { method: Builder['targetKey']; params?: Params }) => Return
      : never
    : never;

/**
 * A type containing all permitted JSON-RPC methods.
 */
type PermittedMethodFunction = {
  [MethodName in keyof typeof methodHandlers]: PermittedMethod<
    MethodName,
    typeof methodHandlers[MethodName]
  >;
};

/**
 * A type containing all restricted JSON-RPC methods.
 */
type RestrictedMethodFunction = {
  [Builder in keyof typeof restrictedMethodPermissionBuilders]: RestrictedMethod<
    typeof restrictedMethodPermissionBuilders[Builder]
  >;
};

/**
 * A type containing all supported JSON-RPC methods.
 */
type MethodFunction = RestrictedMethodFunction & PermittedMethodFunction;

/**
 * The request arguments for a JSON-RPC method.
 *
 * @template MethodName - The name of the method. In most cases this is inferred
 * from the args.
 */
export type MethodRequestArguments<MethodName extends keyof MethodFunction> = {
  method: MethodName;
  params?: Parameters<MethodFunction[MethodName]>[0] extends {
    params?: infer Params;
  }
    ? Params
    : never;
};

/**
 * A function that takes a JSON-RPC request and returns a JSON-RPC response.
 *
 * @template MethodName - The name of the method. In most cases this is inferred
 * from the args.
 */
export type RequestFunction = <MethodName extends keyof MethodFunction>(
  args: MethodRequestArguments<MethodName>,
) => ReturnType<MethodFunction[MethodName]>;

/**
 * The global `snap` object. This is injected into the global scope of a snap.
 */
export type SnapsGlobalObject = {
  request: RequestFunction;
};
