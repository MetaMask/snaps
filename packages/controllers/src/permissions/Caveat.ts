import { Json } from 'json-rpc-engine';

interface CaveatOptions<ValueType extends Json> {
  type: string;
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
   * The type of the caveat. The type is presumed to be meaningful in the
   * context of the capability it is associated with.
   *
   * In MetaMask, every permission can only have one caveat of each type.
   */
  public readonly type: string;

  /**
   * Any additional data necessary to enforce the caveat.
   *
   * TODO: Make optional in typescript@4.4.x
   */
  public readonly value: ValueType;

  constructor({ type, value }: CaveatOptions<ValueType>) {
    this.type = type;
    this.value = value;
  }
}
