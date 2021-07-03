import { Json, JsonRpcRequest, PendingJsonRpcResponse } from 'json-rpc-engine';
import { Caveat } from './Caveat';
import { Permission } from './Permission';
import { PermittedJsonRpcMiddleware } from './PermissionController';

type CaveatType = string;

/**
 * The implementation of a caveat type.
 */
type CaveatFunction<
  CaveatValue extends Json,
  Params extends Json,
  Result extends Json,
> = (
  caveatObject: Caveat<CaveatValue>,
  request: JsonRpcRequest<Params>,
) => CaveatReturnHandler<Result> | undefined;

type CaveatImplementationFactory<
  CaveatValue extends Json,
  MethodParameters extends Json,
  MethodResult extends Json,
> = (
  caveatValue: CaveatValue,
) => CaveatFunction<CaveatValue, MethodParameters, MethodResult>;

export interface CaveatSpecification<
  CaveatValue extends Json,
  MethodParameters extends Json,
  MethodResult extends Json,
> {
  type: CaveatType;
  getImplementation: CaveatImplementationFactory<
    CaveatValue,
    MethodParameters,
    MethodResult
  >;
}

export type CaveatSpecifications = Record<
  CaveatType,
  CaveatSpecification<Json, Json, Json>
>;

/**
 * A {@link CaveatFunction} whose `caveatObject` argument has been bound to
 * the caveat object of a particular permission.
 */
type BoundCaveatFunction<Params, Result> = (
  request: JsonRpcRequest<Params>,
) => CaveatReturnHandler<Result> | undefined;

type CaveatReturnHandler<Result> = (
  response: PendingJsonRpcResponse<Result>,
) => void;

/**
 * Decorate a restricted method implementation with its caveats.
 */
export function decorateWithCaveats(
  methodName: string,
  methodImplementation: PermittedJsonRpcMiddleware<Json, Json>,
  getPermission: (method: string) => Permission, // bound to the requesting origin
  caveatImplementations: Record<CaveatType, CaveatFunction<Json, Json, Json>>, // all caveat implementations
): PermittedJsonRpcMiddleware<Json, Json> {
  const { caveats } = getPermission(methodName);

  // If the permission has caveats, create an array of invocations of their
  // corresponding functions bound to the caveat objects.
  const caveatFunctions: BoundCaveatFunction<Json, Json>[] = [];
  if (caveats && caveats.length > 0) {
    for (const caveat of caveats) {
      if (!caveatImplementations[caveat.type]) {
        throw new Error(`Unrecognized caveat type: ${caveat.type}`);
      }

      caveatFunctions.push((request: JsonRpcRequest<Json>) =>
        caveatImplementations[caveat.type](caveat, request),
      );
    }
  }

  return ((req, res, next, end, context) => {
    // If there are caveats, apply them to the request.
    if (caveatFunctions.length > 0) {
      const caveatReturnHandlers = applyCaveats(req, caveatFunctions);

      // If any of the caveats specified return handlers, wrap the "end"
      // callback such that the return handlers are applied to the response
      // before actually ending the request.
      if (caveatReturnHandlers.length > 0) {
        const endWithReturnHandlers = () => {
          caveatReturnHandlers.forEach((returnHandler) => returnHandler(res));
          end();
        };

        return methodImplementation(
          req,
          res,
          next,
          endWithReturnHandlers,
          context,
        );
      }
    }
    return methodImplementation(req, res, next, end, context);
  }) as PermittedJsonRpcMiddleware<Json, Json>;
}

function applyCaveats(
  req: JsonRpcRequest<Json>,
  caveatFunctions: BoundCaveatFunction<Json, Json>[],
): CaveatReturnHandler<Json>[] {
  const returnHandlers: CaveatReturnHandler<Json>[] = [];

  for (const caveatFunction of caveatFunctions) {
    const returnHandler = caveatFunction(req);

    if (returnHandler) {
      returnHandlers.push(returnHandler);
    }
  }
  return returnHandlers;
}
