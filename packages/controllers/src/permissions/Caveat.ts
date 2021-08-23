import { Json } from 'json-rpc-engine';

type CaveatOptions<ValueType extends Json> = {
  type: string;
  value: ValueType;
};

export type ZcapLdCaveat = {
  /**
   * The type of the caveat, which is presumed to be meaningful in the context
   * of the capability it is associated with.
   */
  type: string;
};

/**
 * Identical to instances of the Caveat class, useful for when TypeScript
 * has a meltdown over assigning classes to the Json type.
 */
export type CaveatInterface<Value extends Json> = ZcapLdCaveat & {
  value: Value;
};

/**
 * TODO: Document
 */
export class Caveat<Value extends Json> implements CaveatInterface<Value> {
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
  public readonly value: Value;

  constructor({ type, value }: CaveatOptions<Value>) {
    this.type = type;
    this.value = value;
  }
}
