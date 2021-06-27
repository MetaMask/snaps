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
 *
 */
export interface ZcapLdCaveat {
  /**
   * The type of the caveat, which is presumed to be meaningful in the context
   * of the capability it is associated with.
   */
  type: string;
}

/**
 * TODO: Document
 */
export class Caveat<ValueType extends Json> implements ZcapLdCaveat {
  /**
   * The type of the caveat.
   */
  public readonly type: CaveatType;

  /**
   * The unique name of the caveat.
   *
   * TODO: Make optional in typescript@4.4.x
   */
  public readonly name: string | null;

  /**
   * Any additional data necessary to enforce the caveat.
   *
   * TODO: Make optional in typescript@4.4.x
   */
  public readonly value: ValueType;

  constructor({ type, name, value }: CaveatOptions<ValueType>) {
    this.type = type;
    this.name = name || null;
    this.value = value;
  }
}
