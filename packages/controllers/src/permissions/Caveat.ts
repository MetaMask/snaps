import { Json } from 'json-rpc-engine';

import { UnrecognizedCaveatTypeError } from './errors';
import {
  AsyncRestrictedMethod,
  PermissionBase,
  PermissionSpecificationBase,
  RestrictedMethodBase,
  RestrictedMethodParameters,
} from './Permission';

/**
 * Identical to instances of the Caveat class, useful for when TypeScript
 * has a meltdown over assigning classes to the Json type.
 *
 * @template Type - The type of the caveat.
 * @template Value - The value associated with the caveat.
 */
export type CaveatBase<CaveatSpecification extends CaveatSpecificationBase> = {
  /**
   * The type of the caveat. The type is presumed to be meaningful in the
   * context of the capability it is associated with.
   *
   * In MetaMask, every permission can only have one caveat of each type.
   */
  readonly type: CaveatSpecification['type'];

  /**
   * Any additional data necessary to enforce the caveat.
   *
   * TODO:TS4.4 Make optional
   */
  readonly value: Parameters<CaveatSpecification['decorator']>[1]['value'];
};

export type CaveatConstraint = {
  type: string;
  value: Json;
};

/**
 * The {@link CaveatBase} factory function. Naively constructs a new caveat from the
 * inputs. Sets `value` to `null` if no value is provided.
 *
 * @param type - The type of the caveat.
 * @param value - The value associated with the caveat, if any.
 * @returns The new caveat object.
 */
export function constructCaveat<
  CaveatSpecification extends CaveatSpecificationBase,
>(type: string, value: Json): CaveatBase<CaveatSpecification> {
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
export type CaveatDecoratorConstraint = (
  decorated: AsyncRestrictedMethod<RestrictedMethodParameters, Json>,
  caveat: CaveatConstraint,
) => AsyncRestrictedMethod<RestrictedMethodParameters, Json>;

export type ExtractCaveatValueFromDecorator<
  CaveatSpecification extends CaveatSpecificationBase,
> = Parameters<CaveatSpecification['decorator']>[1]['value'];

type CaveatValidatorConstraint = (
  caveat: CaveatConstraint,
  origin?: string,
  target?: string,
) => void;

export type CaveatSpecificationBase = {
  /**
   * The type of the caveat.
   */
  type: string;

  /**
   * The decorator function used to apply the caveat to restricted method
   * requests.
   */
  decorator: CaveatDecoratorConstraint;

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
  validator?: CaveatValidatorConstraint;
};

export type CaveatSpecificationsMap<
  Specification extends CaveatSpecificationBase,
> = {
  [Key in Specification['type']]: Specification extends CaveatSpecificationBase
    ? Specification
    : never;
};

export type ExtractCaveats<
  CaveatSpecification extends CaveatSpecificationBase,
> = {
  type: CaveatSpecification['type'];
  value: Parameters<CaveatSpecification['decorator']>[1]['value'];
};

type ExtractDecorator<
  CaveatSpecification extends CaveatSpecificationBase,
  CaveatType extends string,
> = CaveatSpecification extends {
  type: CaveatType;
  decorator: infer Decorator;
}
  ? Decorator
  : never;

export type ExtractCaveat<
  CaveatSpecification extends CaveatSpecificationBase,
  CaveatType extends string,
> = CaveatSpecification extends {
  type: CaveatType;
}
  ? {
      type: CaveatType;
      value: Parameters<
        ExtractDecorator<CaveatSpecification, CaveatType>
      >[1]['value'];
    }
  : never;

/**
 * A utility type for extracting the {@link CaveatBase.value} type from
 * a union of caveat types.
 *
 * @template CaveatUnion - The caveat type union to extract a value type from.
 * @template CaveatType - The type of the caveat whose value to extract.
 */
export type ExtractCaveatValue<
  CaveatSpecification extends CaveatSpecificationBase,
  CaveatType extends string,
> = ExtractCaveat<CaveatSpecification, CaveatType>['value'];

/**
 * Decorate a restricted method implementation with its caveats.
 *
 * Note that all caveat functions (i.e. the argument and return value of the
 * decorator) must be awaited.
 */
export function decorateWithCaveats<
  CaveatSpecification extends CaveatSpecificationBase,
  PermissionSpecification extends PermissionSpecificationBase<CaveatSpecification>,
>(
  methodImplementation: RestrictedMethodBase<RestrictedMethodParameters, Json>,
  permission: PermissionBase<
    PermissionSpecification['type'],
    CaveatSpecification
  >, // bound to the requesting origin
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
