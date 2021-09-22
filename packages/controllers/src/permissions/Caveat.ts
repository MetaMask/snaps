import { Json } from 'json-rpc-engine';

import { UnrecognizedCaveatTypeError } from './errors';
import {
  Permission,
  AsyncRestrictedMethodImplementation,
  RestrictedMethodImplementation,
} from './Permission';

export type ZcapLdCaveat = {
  /**
   * The type of the caveat. The type is presumed to be meaningful in the
   * context of the capability it is associated with.
   *
   * In MetaMask, every permission can only have one caveat of each type.
   */
  readonly type: string;
};

/**
 * Identical to instances of the Caveat class, useful for when TypeScript
 * has a meltdown over assigning classes to the Json type.
 */
export type Caveat<Value extends Json> = ZcapLdCaveat & {
  /**
   * Any additional data necessary to enforce the caveat.
   *
   * TODO: Make optional in typescript@4.4.x
   */
  readonly value: Value;
};

/**
 * The {@link Caveat} factory function. Naively constructs a new caveat from the
 * inputs. Sets `value` to `null` if no value is provided.
 *
 * @param type - The type of the caveat.
 * @param value - The value associated with the caveat, if any.
 * @returns The new caveat object.
 */
export function constructCaveat(
  type: string,
  value: unknown,
): { type: string; value: unknown } {
  return { type, value };
}

// Next, we define types used for specifying caveats at the consumer layer,
// and a function for applying caveats to a restricted method request. This is
// Accomplished by decorating the restricted method implementation with the
// the corresponding caveat functions.

export type CaveatDecorator<CaveatValue extends Json> = (
  decorated: AsyncRestrictedMethodImplementation<Json, Json>,
  caveat: Caveat<CaveatValue>,
) => AsyncRestrictedMethodImplementation<Json, Json>;

export type CaveatValidator<Caveats extends GenericCaveat> = (
  origin: string,
  target: string,
  caveat: { type: string; value: unknown },
) => caveat is Caveats;

export type CaveatSpecification<
  CaveatType extends string,
  CaveatValue extends Json,
> = {
  /**
   * The string type of the caveat.
   */
  type: CaveatType;

  /**
   * The decorator function used to apply the caveat to restricted method
   * requests.
   */
  decorator: CaveatDecorator<CaveatValue>;

  /**
   * The validator function used to validate caveats of the associated type
   * whenever they are instantiated. Caveats are instantiated whenever they are
   * created or mutated.
   *
   * The validator should throw an appropriate JSON-RPC error if validation fails.
   *
   * If no validator is specified, no validation of caveat values will be
   * performed. Although caveats can also be validated by permission validators,
   * validating caveat values separately is strongly recommended.
   */
  validator?: CaveatValidator<Caveat<CaveatValue>>;
};

export type CaveatSpecifications = Readonly<
  Record<string, CaveatSpecification<string, Json>>
>;

export type GenericCaveat = Caveat<Json>;

export type CaveatSpec<Caveats extends Caveat<Json>> = CaveatSpecification<
  Caveats['type'],
  ExtractCaveatValue<Caveats, Caveats['type']>
>;

export type CaveatSpecs<Caveats extends Caveat<Json>> = Record<
  Caveats['type'],
  CaveatSpec<Caveats>
>;

export type ExtractCaveatValue<Caveats, CaveatType> = Caveats extends {
  type: CaveatType;
  value: infer CaveatValue;
}
  ? CaveatValue
  : never;

/**
 * Decorate a restricted method implementation with its caveats.
 *
 * TODO: Document how to create caveats using below examples.
 * Note that all caveat functions (i.e. the argument and return value of the decorator)
 * must be awaited.
 */
export function decorateWithCaveats<Caveats extends GenericCaveat>(
  methodImplementation: RestrictedMethodImplementation<Json, Json>,
  permission: Readonly<Permission>, // bound to the requesting origin
  caveatSpecifications: CaveatSpecs<Caveats>, // all caveat implementations
): RestrictedMethodImplementation<Json, Json> {
  const caveats = permission.caveats ?? [];

  let decorated = methodImplementation as AsyncRestrictedMethodImplementation<
    Json,
    Json
  >;
  // TODO:types fix the base caveat types
  for (const caveat of caveats) {
    const specification = caveatSpecifications[caveat.type as Caveats['type']];
    if (!specification) {
      throw new UnrecognizedCaveatTypeError(caveat.type);
    }

    decorated = specification.decorator(decorated, caveat as any);
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
// export function eth_accounts(next: MethodImplementation, caveat: Caveat<string[]>) {
//   return async (req: JsonRpcRequest<Json>, context: Record<string, unknown>) => {
//     const accounts = await next(req, context);
//     return accounts.filter((account: string) => caveat.value.includes(account))
//   };
// }
