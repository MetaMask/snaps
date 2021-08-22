import { Json } from 'json-rpc-engine';
import { Caveat } from './Caveat';
import { UnrecognizedCaveatTypeError } from './errors';
import { Permission } from './Permission';
import {
  AsyncRestrictedMethodImplementation,
  RestrictedMethodImplementation,
} from './PermissionController';

type CaveatType = string;

type CaveatValueValidator<CaveatValue extends Json> = (
  caveatValue: CaveatValue,
  origin?: string,
  target?: string,
) => void;

type CaveatDecorator = (
  decorated: AsyncRestrictedMethodImplementation<Json, Json>,
  caveat: Caveat<Json>,
) => AsyncRestrictedMethodImplementation<Json, Json>;

export interface CaveatSpecification<CaveatValue extends Json> {
  type: CaveatType;
  decorator: CaveatDecorator;
  validator: CaveatValueValidator<CaveatValue>;
}

export type CaveatSpecifications = Readonly<
  Record<CaveatType, CaveatSpecification<Json>>
>;

/**
 * Decorate a restricted method implementation with its caveats.
 *
 * TODO: Document how to create caveats using below examples.
 * Note that all caveat functions (i.e. the argument and return value of the decorator)
 * must be awaited.
 */
export function decorateWithCaveats(
  methodImplementation: RestrictedMethodImplementation<Json, Json>,
  permission: Readonly<Permission>, // bound to the requesting origin
  caveatSpecifications: CaveatSpecifications, // all caveat implementations
): RestrictedMethodImplementation<Json, Json> {
  const caveats = permission.caveats ?? [];

  let decorated = methodImplementation as AsyncRestrictedMethodImplementation<
    Json,
    Json
  >;
  for (const caveat of caveats) {
    const specification = caveatSpecifications[caveat.type];
    if (!specification) {
      throw new UnrecognizedCaveatTypeError(caveat.type);
    }

    decorated = specification.decorator(decorated, caveat);
  }
  return decorated;
}

// Return next example.
//
// export function ifMetaMask(next: MethodImplementation) {
//   return async (req: JsonRpcRequest<Json>, context: Record<string, unknown>) => {
//     if (context.origin !== 'metamask.io') {
//       return new EthereumJsonRpcError();
//     }
//
//     return next(req, context);
//   };
// }

// "Return handler" example
//
// export function eth_accounts(next: MethodImplementation) {
//   return async (req: JsonRpcRequest<Json>, context: Record<string, unknown>) => {
//     const accounts = await next(req, context);
//     return accounts.filter(() => {
//        // filter
//     });
//   };
// }
