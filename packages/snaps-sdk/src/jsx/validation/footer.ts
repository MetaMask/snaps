import { refine, tuple } from '@metamask/superstruct';

import type { Describe } from '../../internals';
import { selectiveUnion } from '../../internals';
import type { FooterElement } from '../components';
import { element } from './component';
import { ButtonStruct } from './form/button';

const FooterButtonStruct = refine(ButtonStruct, 'FooterButton', (value) => {
  if (
    typeof value.props.children === 'string' ||
    typeof value.props.children === 'boolean' ||
    value.props.children === null
  ) {
    return true;
  }

  if (Array.isArray(value.props.children)) {
    const hasNonTextElements = value.props.children.some(
      (child) =>
        typeof child !== 'string' &&
        typeof child !== 'boolean' &&
        child !== null,
    );

    if (!hasNonTextElements) {
      return true;
    }
  }

  return 'Footer buttons may only contain text.';
});

/**
 * A subset of JSX elements that are allowed as children of the Footer component.
 * This set should include a single button or a tuple of two buttons.
 */

export const FooterChildStruct = selectiveUnion((value) => {
  if (Array.isArray(value)) {
    return tuple([FooterButtonStruct, FooterButtonStruct]);
  }
  return FooterButtonStruct;
});

/**
 * A struct for the {@link FooterElement} type.
 */
export const FooterStruct: Describe<FooterElement> = element('Footer', {
  children: FooterChildStruct,
});
