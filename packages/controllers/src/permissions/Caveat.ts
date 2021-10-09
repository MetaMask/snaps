import { Json } from 'json-rpc-engine';

import { UnrecognizedCaveatTypeError } from './errors';
import {
  AsyncRestrictedMethod,
  RestrictedMethodBase,
  GenericPermission,
  RestrictedMethodParameters,
} from './Permission';

/**
 * Identical to instances of the Caveat class, useful for when TypeScript
 * has a meltdown over assigning classes to the Json type.
 *
 * @template Type - The type of the caveat.
 * @template Value - The value associated with the caveat.
 */
export type CaveatBase<Type extends string, Value extends Json> = {
  /**
   * The type of the caveat. The type is presumed to be meaningful in the
   * context of the capability it is associated with.
   *
   * In MetaMask, every permission can only have one caveat of each type.
   */
  readonly type: Type;

  /**
   * Any additional data necessary to enforce the caveat.
   *
   * TODO:TS4.4 Make optional
   */
  readonly value: Value;
};

/**
 * The {@link CaveatBase} factory function. Naively constructs a new caveat from the
 * inputs. Sets `value` to `null` if no value is provided.
 *
 * @param type - The type of the caveat.
 * @param value - The value associated with the caveat, if any.
 * @returns The new caveat object.
 */
export function constructCaveat<Type extends string, Value extends Json>(
  type: Type,
  value: Value,
): CaveatBase<Type, Value> {
  return { type, value };
}

// Next, we define types used for specifying caveats at the consumer layer,
// and a function for applying caveats to a restricted method request. This is
// Accomplished by decorating the restricted method implementation with the
// the corresponding caveat functions.

/**
 * A function for applying caveats to a restricted method request.
 *
 * @template Caveat - The caveat type associated with this decorator.
 * @param decorated - The restricted method implementation to be decorated.
 * The method may have already been decorated with other caveats.
 * @param caveat - The caveat object.
 * @returns The decorate restricted method implementation.
 */
export type CaveatDecorator<Caveat extends GenericCaveat> = (
  decorated: AsyncRestrictedMethod<RestrictedMethodParameters, Json>,
  caveat: Caveat,
) => AsyncRestrictedMethod<RestrictedMethodParameters, Json>;

export type ExtractCaveatValueFromDecorator<
  Decorator extends CaveatDecorator<any>,
> = Decorator extends (
  decorated: any,
  caveat: infer Caveat,
) => AsyncRestrictedMethod<any, any>
  ? Caveat extends GenericCaveat
    ? Caveat['value']
    : never
  : never;

type CaveatValidator<Caveat extends GenericCaveat> = (
  caveat: { type: Caveat['type']; value: unknown },
  origin?: string,
  target?: string,
) => void;

export type CaveatSpecificationBase<Type extends string> = {
  /**
   * The string type of the caveat.
   */
  type: Type;

  /**
   * The decorator function used to apply the caveat to restricted method
   * requests.
   */
  decorator: CaveatDecorator<any>;

  /**
   * The validator function used to validate caveats of the associated type
   * whenever they are instantiated. Caveat are instantiated whenever they are
   * created or mutated.
   *
   * The validator should throw an appropriate JSON-RPC error if validation fails.
   *
   * If no validator is specified, no validation of caveat values will be
   * performed. Although caveats can also be validated by permission validators,
   * validating caveat values separately is strongly recommended.
   */
  validator?: CaveatValidator<any>;
};

/**
 * A generic caveat.
 */
export type GenericCaveat = CaveatBase<string, Json>;

export type CaveatSpecificationsMap<
  Specification extends CaveatSpecificationBase<string>,
> = {
  [Key in Specification['type']]: Specification extends CaveatSpecificationBase<Key>
    ? Specification
    : never;
};

export type ExtractCaveats<
  Specification extends CaveatSpecificationBase<string>,
> = Specification extends any
  ? CaveatBase<
      Specification['type'],
      ExtractCaveatValueFromDecorator<Specification['decorator']>
    >
  : never;

/**
 * Internal utility type, because using parameterized types in conditional types
 * causes weird things to happen.
 */
type _ExtractCaveat<
  Caveat extends GenericCaveat,
  CaveatType extends string,
> = Caveat extends CaveatBase<CaveatType, Json> ? Caveat : never;

export type ExtractCaveat<
  CaveatSpecification extends CaveatSpecificationBase<string>,
  CaveatType extends string,
> = _ExtractCaveat<ExtractCaveats<CaveatSpecification>, CaveatType>;
// extends CaveatBase<CaveatType, Json>
//   ? ExtractCaveats<CaveatSpecification>
//   : never;

/**
 * A utility type for extracting the {@link CaveatBase.value} type from
 * a union of caveat types.
 *
 * @template CaveatUnion - The caveat type union to extract a value type from.
 * @template CaveatType - The type of the caveat whose value to extract.
 */
export type ExtractCaveatValue<
  CaveatSpecification extends CaveatSpecificationBase<string>,
  CaveatType extends string,
> = ExtractCaveat<CaveatSpecification, CaveatType>['value'];
// export type ExtractCaveatValue<
//   CaveatUnion extends GenericCaveat,
//   CaveatType extends string,
// > = CaveatUnion extends CaveatBase<CaveatType, infer CaveatValue>
//   ? CaveatValue
//   : never;

/**
 * Decorate a restricted method implementation with its caveats.
 *
 * Note that all caveat functions (i.e. the argument and return value of the
 * decorator) must be awaited.
 */
export function decorateWithCaveats<
  CaveatSpecification extends CaveatSpecificationBase<string>,
>(
  methodImplementation: RestrictedMethodBase<RestrictedMethodParameters, Json>,
  permission: Readonly<GenericPermission>, // bound to the requesting origin
  caveatSpecifications: CaveatSpecificationsMap<CaveatSpecification>, // all caveat implementations
): RestrictedMethodBase<RestrictedMethodParameters, Json> {
  const { caveats } = permission;
  if (!caveats) {
    return methodImplementation;
  }

  let decorated = methodImplementation as AsyncRestrictedMethod<
    RestrictedMethodParameters,
    Json
  >;

  for (const caveat of caveats) {
    const specification =
      caveatSpecifications[caveat.type as CaveatSpecification['type']];
    if (!specification) {
      throw new UnrecognizedCaveatTypeError(caveat.type);
    }

    decorated = specification.decorator(decorated, caveat);
  }

  return decorated;
}
