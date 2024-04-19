import type { FieldElement } from '@metamask/snaps-sdk/jsx';

import type { ButtonElement } from './Button';
import type { FormElement } from './Form';
import type { InputElement } from './Input';

export * from './Button';
export * from './Field';
export * from './Form';
export * from './Input';

export type StandardFormElement =
  | ButtonElement
  | FormElement
  | FieldElement
  | InputElement;
