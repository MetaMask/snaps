import { boolean, optional, string } from '@metamask/superstruct';

import type { Describe } from '../../internals';
import type { CopyableElement } from '../components';
import { element } from './component';

/**
 * A struct for the {@link CopyableElement} type.
 */
export const CopyableStruct: Describe<CopyableElement> = element('Copyable', {
  value: string(),
  sensitive: optional(boolean()),
});
