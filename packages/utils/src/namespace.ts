import {
  array,
  Infer,
  is,
  object,
  optional,
  pattern,
  record,
  size,
  string,
} from 'superstruct';

/**
 * A helper struct for a string with a minimum length of 1 and a maximum length
 * of 40.
 */
export const LimitedString = size(string(), 1, 40);

/**
 * A CAIP-2 chain ID, i.e., a human-readable namespace and reference.
 */
export const ChainIdStruct = pattern(
  string(),
  /^[-a-z0-9]{3,8}:[-a-zA-Z0-9]{1,32}$/u,
);
export type ChainId = `${string}:${string}`;

/**
 * A chain descriptor.
 */
export const ChainStruct = object({
  id: ChainIdStruct,
  name: LimitedString,
});
export type Chain = Infer<typeof ChainStruct>;

export const NamespaceStruct = object({
  /**
   * A list of supported chains in the namespace.
   */
  chains: array(ChainStruct),

  /**
   * A list of supported RPC methods on the namespace, that a DApp can call.
   */
  methods: optional(array(LimitedString)),

  /**
   * A list of supported RPC events on the namespace, that a DApp can listen to.
   */
  events: optional(array(LimitedString)),
});
export type Namespace = Infer<typeof NamespaceStruct>;

/**
 * A CAIP-2 namespace, i.e., the first part of a chain ID.
 */
export const NamespaceKeyStruct = pattern(string(), /^[-a-z0-9]{3,8}$/u);
export type NamespaceKey = Infer<typeof NamespaceKeyStruct>;

/**
 * An object mapping CAIP-2 namespaces to their values.
 */
export const NamespacesStruct = record(NamespaceKeyStruct, NamespaceStruct);
export type Namespaces = Infer<typeof NamespacesStruct>;

/**
 * Check if a value is a namespace.
 *
 * @param value - The value to validate.
 * @returns True if the value is a valid namespace.
 */
export function isNamespace(value: unknown): value is Namespace {
  return is(value, NamespaceStruct);
}

/**
 * Check if a value is an object containing namespaces.
 *
 * @param value - The value to validate.
 * @returns True if the value is a valid object containing namespaces.
 */
export function isNamespacesObject(value: unknown): value is Namespaces {
  return is(value, NamespacesStruct);
}
