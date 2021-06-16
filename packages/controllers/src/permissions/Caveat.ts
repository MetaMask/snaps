import { Json } from 'json-rpc-engine';

export enum CaveatType {
  FilterResponse = 'filterResponse',
  ForceParams = 'forceParams',
  LimitResponseLength = 'limitResponseLength',
  RequireParamsIsSubset = 'requireParamsIsSubset',
  RequireParamsIsSuperset = 'requireParamsIsSuperset',
}

interface CaveatOptions<ValueType extends Json> {
  type: CaveatType;
  name?: string;
  value: ValueType;
}

/**
 * A caveat is...
 */
export class Caveat<ValueType extends Json> {
  /**
   * The type of the caveat.
   */
  public readonly type: CaveatType;

  /**
   * The unique name of the caveat.
   *
   * TODO: Should be optional
   */
  public readonly name: string | null;

  /**
   * Any additional data necessary to enforce the caveat.
   *
   * TODO: Should be optional
   */
  public readonly value: ValueType;

  constructor({ type, name, value }: CaveatOptions<ValueType>) {
    this.type = type;
    this.name = name || null;
    this.value = value;
  }
}
