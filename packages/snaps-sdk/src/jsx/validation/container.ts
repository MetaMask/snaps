import type { Struct } from '@metamask/superstruct';
import { tuple } from '@metamask/superstruct';

import { BoxChildStruct } from '..';
import { selectiveUnion, type Describe } from '../../internals';
import type { GenericSnapElement } from '../component';
import type { ContainerElement, FooterElement } from '../components';
import { element } from './component';
import { FooterStruct } from './footer';

/**
 * A struct for the {@link ContainerElement} type.
 */
export const ContainerStruct: Describe<ContainerElement> = element(
  'Container',
  {
    children: selectiveUnion((value) => {
      if (Array.isArray(value)) {
        return tuple([BoxChildStruct, FooterStruct]);
      }
      return BoxChildStruct;
    }) as unknown as Struct<
      [GenericSnapElement, FooterElement] | GenericSnapElement,
      null
    >,
  },
);
