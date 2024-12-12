import {
  assign,
  number,
  object,
  optional,
  string,
} from '@metamask/superstruct';
import { hasProperty, isPlainObject } from '@metamask/utils';

import type { Describe } from '../../../internals';
import { literal } from '../../../internals';
import type { InputElement } from '../../components';
import { elementWithSelectiveProps } from '../component';

/**
 * A struct for the generic input element props.
 */
export const GenericInputPropsStruct = object({
  name: string(),
  value: optional(string()),
  placeholder: optional(string()),
});

/**
 * A struct for the text type input props.
 */
export const TextInputPropsStruct = assign(
  GenericInputPropsStruct,
  object({
    type: literal('text'),
  }),
);

/**
 * A struct for the password type input props.
 */
export const PasswordInputPropsStruct = assign(
  GenericInputPropsStruct,
  object({
    type: literal('password'),
  }),
);

/**
 * A struct for the number type input props.
 */
export const NumberInputPropsStruct = assign(
  GenericInputPropsStruct,
  object({
    type: literal('number'),
    min: optional(number()),
    max: optional(number()),
    step: optional(number()),
  }),
);

/**
 * A struct for the {@link InputElement} type.
 */
export const InputStruct: Describe<InputElement> = elementWithSelectiveProps(
  'Input',
  (value) => {
    if (isPlainObject(value) && hasProperty(value, 'type')) {
      switch (value.type) {
        case 'text':
          return TextInputPropsStruct;
        case 'password':
          return PasswordInputPropsStruct;
        case 'number':
          return NumberInputPropsStruct;
        default:
          return GenericInputPropsStruct;
      }
    }
    return GenericInputPropsStruct;
  },
);
