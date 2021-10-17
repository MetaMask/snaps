import { Json } from 'json-rpc-engine';

import { UnrecognizedCaveatTypeError } from './errors';
import {
  AsyncRestrictedMethod,
  RestrictedMethod,
  GenericPermission,
  RestrictedMethodParameters,
} from './Permission';

export type CaveatConstraint = {
  /**
   * The type of the caveat. The type is presumed to be meaningful in the
   * context of the capability it is associated with.
   *
   * In MetaMask, every permission can only have one caveat of each type.
   */
  readonly type: string;

  /**
   * Any additional data necessary to enforce the caveat.
   *
   * TODO:TS4.4 Make optional
   */
  readonly value: Json;
};

/**
 * TODO:docs
 *
 * @template Type - The type of the caveat.
 * @template Value - The value associated with the caveat.
 */
export type Caveat<Type extends string, Value extends Json> = {
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
 * The {@link Caveat} factory function. Naively constructs a new caveat from the
 * inputs. Sets `value` to `null` if no value is provided.
 *
 * @param type - The type of the caveat.
 * @param value - The value associated with the caveat, if any.
 * @returns The new caveat object.
 */
export function constructCaveat<Type extends string, Value extends Json>(
  type: Type,
  value: Value,
): Caveat<Type, Value> {
  return { type, value };
}

// Next, we define types used for specifying caveats at the consumer layer,
// and a function for applying caveats to a restricted method request. This is
// Accomplished by decorating the restricted method implementation with the
// the corresponding caveat functions.

/**
 * A function for applying caveats to a restricted method request.
 *
 * @template ParentCaveat - The caveat type associated with this decorator.
 * @param decorated - The restricted method implementation to be decorated.
 * The method may have already been decorated with other caveats.
 * @param caveat - The caveat object.
 * @returns The decorate restricted method implementation.
 */
export type CaveatDecorator<ParentCaveat extends CaveatConstraint> = (
  decorated: AsyncRestrictedMethod<RestrictedMethodParameters, Json>,
  caveat: ParentCaveat,
) => AsyncRestrictedMethod<RestrictedMethodParameters, Json>;

/**
 * TODO:docs
 */
type ExtractCaveatValueFromDecorator<Decorator extends CaveatDecorator<any>> =
  Decorator extends (
    decorated: any,
    caveat: infer ParentCaveat,
  ) => AsyncRestrictedMethod<any, any>
    ? ParentCaveat extends CaveatConstraint
      ? ParentCaveat['value']
      : never
    : never;

/**
 * TODO:docs
 */
export type CaveatValidator<ParentCaveat extends CaveatConstraint> = (
  caveat: { type: ParentCaveat['type']; value: unknown },
  origin?: string,
  target?: string,
) => void;

/**
 * TODO:docs
 */
export type CaveatSpecificationConstraint = {
  /**
   * The string type of the caveat.
   */
  type: string;

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
 * TODO:docs
 */
export type CaveatSpecification<Type extends string> = {
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
 * TODO:docs
 */
export type CaveatSpecificationMap<
  Specification extends CaveatSpecification<string>,
> = {
  [Key in Specification['type']]: Specification extends CaveatSpecification<Key>
    ? Specification
    : never;
};

/**
 * TODO:docs
 */
export type ExtractCaveats<Specification extends CaveatSpecification<string>> =
  Specification extends any
    ? Caveat<
        Specification['type'],
        ExtractCaveatValueFromDecorator<Specification['decorator']>
      >
    : never;

/**
 * Internal utility type, because using parameterized types in conditional types
 * causes weird things to happen.
 */
type _ExtractCaveat<
  CaveatUnion extends CaveatConstraint,
  CaveatType extends string,
> = CaveatUnion extends Caveat<CaveatType, Json> ? CaveatUnion : never;

/**
 * Extracts the type of a specific {@link Caveat} from a union of caveat
 * specifications.
 *
 * @template CaveatSpecifications - The union of all caveat specifications.
 * @template CaveatType - The type of the caveat to extract.
 */
export type ExtractCaveat<
  CaveatSpecifications extends CaveatSpecification<string>,
  CaveatType extends string,
> = _ExtractCaveat<ExtractCaveats<CaveatSpecifications>, CaveatType>;

/**
 * Extracts the value type of a specific {@link Caveat} from a union of caveat
 * specifications.
 *
 * @template CaveatSpecifications - The union of all caveat specifications.
 * @template CaveatType - The type of the caveat whose value to extract.
 */
export type ExtractCaveatValue<
  CaveatSpecifications extends CaveatSpecification<string>,
  CaveatType extends string,
> = ExtractCaveat<CaveatSpecifications, CaveatType>['value'];

/**
 * Decorate a restricted method implementation with its caveats.
 *
 * Note that all caveat functions (i.e. the argument and return value of the
 * decorator) must be awaited.
 */
export function decorateWithCaveats<
  CaveatSpecifications extends CaveatSpecification<string>,
>(
  methodImplementation: RestrictedMethod<RestrictedMethodParameters, Json>,
  permission: Readonly<GenericPermission>, // bound to the requesting origin
  caveatSpecifications: CaveatSpecificationMap<CaveatSpecifications>, // all caveat implementations
): RestrictedMethod<RestrictedMethodParameters, Json> {
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
      caveatSpecifications[caveat.type as CaveatSpecifications['type']];
    if (!specification) {
      throw new UnrecognizedCaveatTypeError(caveat.type);
    }

    decorated = specification.decorator(decorated, caveat);
  }

  return decorated;
}
