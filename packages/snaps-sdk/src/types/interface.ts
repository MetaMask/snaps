import type { Infer } from 'superstruct';
import { nullable, record, string, union } from 'superstruct';

export const FormStateStruct = record(string(), nullable(string()));

export const InterfaceStateStruct = record(
  string(),
  union([FormStateStruct, nullable(string())]),
);

export type FormState = Infer<typeof FormStateStruct>;
export type InterfaceState = Infer<typeof InterfaceStateStruct>;
