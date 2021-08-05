import { Json, JsonRpcRequest, PendingJsonRpcResponse } from 'json-rpc-engine';
import { Caveat } from './Caveat';
import { UnrecognizedCaveatTypeError } from './errors';
import { Permission } from './Permission';
import { RestrictedMethodImplementation } from './PermissionController';

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
  methodImplementation: RestrictedMethodImplementation<Json, Json>,
  getPermission: (method: string) => Permission, // bound to the requesting origin
  caveatImplementations: Record<CaveatType, CaveatFunction<Json, Json, Json>>, // all caveat implementations
): RestrictedMethodImplementation<Json, Json> {
  const { caveats } = getPermission(methodName);

  // If the permission has caveats, create an array of functions that call the
  // corresponding caveat functions with the caveat object and request as
  // arguments.
  if (caveats && caveats.length > 0) {
    const caveatFunctions: BoundCaveatFunction<Json, Json>[] = [];

    for (const caveat of caveats) {
      if (!caveatImplementations[caveat.type]) {
        throw new UnrecognizedCaveatTypeError(caveat.type);
      }

      caveatFunctions.push((request: JsonRpcRequest<Json>) =>
        caveatImplementations[caveat.type](caveat, request),
      );
    }

    return ((req, res, next, end, context) => {
      let _end = end;
      const caveatReturnHandlers = applyCaveats(req, caveatFunctions);

      // If any of the caveats specified return handlers, wrap the "end"
      // callback such that the return handlers are applied to the response
      // before actually ending the request.
      if (caveatReturnHandlers.length > 0) {
        _end = () => {
          caveatReturnHandlers.forEach((returnHandler) => returnHandler(res));
          end();
        };
      }

      return methodImplementation(req, res, next, _end, context);
    }) as RestrictedMethodImplementation<Json, Json>;
  }

  // If there are no caveats, return a function that calls the restricted method
  // implementation directly, without applying any caveats.
  return ((req, res, next, end, context) =>
    methodImplementation(
      req,
      res,
      next,
      end,
      context,
    )) as RestrictedMethodImplementation<Json, Json>;
}

/**
 * Applies the specified caveats to the specified request. Specifically, every
 * caveat function in the array is called with the request object as an argument.
 *
 * @param req - The request to apply caveats to.
 * @param caveatFunctions - The caveats functions to call with the request as
 * an argument.
 * @returns Any return handlers returned by the caveat functions.
 */
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
