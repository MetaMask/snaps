import { array, boolean, optional, string } from '@metamask/superstruct';

import { nullUnion, type Describe } from '../../../internals';
import type { FileInputElement } from '../../components';
import { element } from '../component';

/**
 * A struct for the {@link FileInputElement} type.
 */
export const FileInputStruct: Describe<FileInputElement> = element(
  'FileInput',
  {
    name: string(),
    accept: nullUnion([optional(array(string()))]),
    compact: optional(boolean()),
  },
);
