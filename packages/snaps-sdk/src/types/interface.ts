import type { Infer } from 'superstruct';
import { nullable, record, string, union } from 'superstruct';

export const formStateStruct = record(string(), nullable(string()));

export const interfaceStateStruct = record(
  string(),
  union([formStateStruct, nullable(string())]),
);

export type FormState = Infer<typeof formStateStruct>;
export type InterfaceState = Infer<typeof interfaceStateStruct>;
