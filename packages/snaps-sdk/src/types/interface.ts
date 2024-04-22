import type { Infer } from 'superstruct';
import { nullable, record, string, union } from 'superstruct';

import type { JSXElement } from '../jsx';
import { JSXElementStruct } from '../jsx';
import type { Component } from '../ui';
import { ComponentStruct } from '../ui';

/**
 * To avoid typing problems with the interface state when manipulating it we have to differentiate the state of
 * a form (that will be contained inside the root state) and the root state since a key in the root stat can contain
 * either the value of an input or a sub-state of a form.
 */

export const FormStateStruct = record(string(), nullable(string()));

export const InterfaceStateStruct = record(
  string(),
  union([FormStateStruct, nullable(string())]),
);

export type FormState = Infer<typeof FormStateStruct>;
export type InterfaceState = Infer<typeof InterfaceStateStruct>;

export type SnapInterface = Component | JSXElement;
export const SnapInterfaceStruct = union([ComponentStruct, JSXElementStruct]);
