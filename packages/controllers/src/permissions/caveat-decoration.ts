import { Json } from 'json-rpc-engine';
import { Caveat } from './Caveat';
import { UnrecognizedCaveatTypeError } from './errors';
import { Permission } from './Permission';
import { RestrictedMethodImplementation } from './PermissionController';

type CaveatType = string;

type CaveatValueValidator<CaveatValue extends Json> = (
  caveatValue: CaveatValue,
) => void;

type CaveatDecorator = (
  decorated: RestrictedMethodImplementation<Json, Json>,
  caveat: Caveat<Json>,
) => RestrictedMethodImplementation<Json, Json>;

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
 * TODO: Should all caveat functions be async?
 * TODO: Document how to create caveats using below examples.
 */
export function decorateWithCaveats<
  MethodImplementation extends RestrictedMethodImplementation<Json, Json>,
>(
  methodImplementation: MethodImplementation,
  permission: Readonly<Permission>, // bound to the requesting origin
  caveatSpecifications: CaveatSpecifications, // all caveat implementations
): MethodImplementation {
  const caveats = permission.caveats ?? [];

  let decorated: RestrictedMethodImplementation<Json, Json> =
    methodImplementation;
  for (const caveat of caveats) {
    const specification = caveatSpecifications[caveat.type];
    if (!specification) {
      throw new UnrecognizedCaveatTypeError(caveat.type);
    }

    decorated = specification.decorator(decorated, caveat);
  }
  return decorated as MethodImplementation;
}

// Return next example.
//
// export function ifMetaMask(next: MethodImplementation) {
//   return (req: JsonRpcRequest<Json>, context: Record<string, unknown>) => {
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
//   return (req: JsonRpcRequest<Json>, context: Record<string, unknown>) => {
//     const accounts = next(req, context);
//     return accounts.filter(() => {
//        // filter
//     });
//   };
// }
