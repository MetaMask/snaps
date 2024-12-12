import type { Struct } from '@metamask/superstruct';
import { optional } from '@metamask/superstruct';
import { CaipAccountIdStruct } from '@metamask/utils';

import { literal, nullUnion } from '../../internals';
import type { AvatarElement } from '../components';
import { element } from './component';

/**
 * A struct for the {@link AvatarElement} type.
 */
export const AvatarStruct = element('Avatar', {
  address: CaipAccountIdStruct,
  size: optional(nullUnion([literal('sm'), literal('md'), literal('lg')])),
}) as unknown as Struct<AvatarElement, null>;
