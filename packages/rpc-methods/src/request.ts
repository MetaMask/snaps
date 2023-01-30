import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
} from '@metamask/permission-controller';
import { PermittedHandlerExport } from '@metamask/types';
import { JsonRpcParams } from '@metamask/utils';

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
type GenericMethodFunction = `wallet_${string}`;

/**
 * Get a typed function if the method is defined in {@link MethodFunction}, or
 * a generic function if the method name extends {@link GenericMethodFunction}.
 * Otherwise, this returns `never`.
 */
type MethodFunctionFallback<MethodName> =
  MethodName extends keyof MethodFunction
    ? MethodFunction[MethodName]
    : MethodName extends GenericMethodFunction
    ? (args: { method: MethodName; params?: JsonRpcParams }) => Promise<unknown>
    : never;

/**
 * The request arguments for a JSON-RPC method.
 *
 * @template MethodName - The name of the method. In most cases this is inferred
 * from the args.
 */
export type MethodRequestArguments<
  MethodName extends keyof MethodFunction | GenericMethodFunction,
> = {
  method: MethodName;
  params?: Parameters<MethodFunctionFallback<MethodName>>[0] extends {
    params?: infer Params;
  }
    ? Params
    : never;
};

export type MethodReturnType<
  MethodName extends keyof MethodFunction | GenericMethodFunction,
> = ReturnType<MethodFunctionFallback<MethodName>>;

/**
 * A function that takes a JSON-RPC request and returns a JSON-RPC response.
 *
 * @template MethodName - The name of the method. In most cases this is inferred
 * from the args.
 */
export type RequestFunction = <
  MethodName extends keyof MethodFunction | GenericMethodFunction,
>(
  args: MethodRequestArguments<MethodName>,
) => MethodReturnType<MethodName>;

/**
 * The global `snap` object. This is injected into the global scope of a snap.
 */
export type SnapsGlobalObject = {
  request: RequestFunction;
};
