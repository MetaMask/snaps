import type { Infer } from 'superstruct';
import { nullable, record, string, union } from 'superstruct';

export const InterfaceStateStruct = record(
  string(),
  union([record(string(), nullable(string())), nullable(string())]),
);

export type InterfaceState = Infer<typeof InterfaceStateStruct>;
