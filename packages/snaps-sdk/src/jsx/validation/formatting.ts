import type { Struct } from '@metamask/superstruct';
import { lazy, string } from '@metamask/superstruct';

import { typedUnion, type Describe } from '../../internals';
import type { JsonObject, SnapElement } from '../component';
import type {
  BoldElement,
  ItalicElement,
  StandardFormattingElement,
} from '../components';
import { children, element } from './component';

/**
 * A struct for the {@link BoldElement} type.
 */
export const BoldStruct: Describe<BoldElement> = element('Bold', {
  children: children([
    string(),
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    lazy(() => ItalicStruct) as unknown as Struct<
      SnapElement<JsonObject, 'Italic'>
    >,
  ]),
});
/**
 * A struct for the {@link ItalicElement} type.
 */
export const ItalicStruct: Describe<ItalicElement> = element('Italic', {
  children: children([
    string(),
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    lazy(() => BoldStruct) as unknown as Struct<
      SnapElement<JsonObject, 'Bold'>
    >,
  ]),
});

export const FormattingStruct: Describe<StandardFormattingElement> = typedUnion(
  [BoldStruct, ItalicStruct],
);
