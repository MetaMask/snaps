import { string } from '@metamask/superstruct';

import type { Describe } from '../../../internals';
import type { FormElement } from '../../components';
import { BoxChildrenStruct } from '../box';
import { element } from '../component';

/**
 * A subset of JSX elements that are allowed as children of the Form component.
 */
export const FormChildStruct = BoxChildrenStruct;

/**
 * A struct for the {@link FormElement} type.
 */
export const FormStruct: Describe<FormElement> = element('Form', {
  children: FormChildStruct,
  name: string(),
});
