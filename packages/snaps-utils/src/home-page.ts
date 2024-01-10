import type { OnHomePageResponse } from '@metamask/snaps-sdk';
import { hasProperty } from '@metamask/utils';

import type {
  OnHomePageResponseWithContent,
  OnHomePageResponseWithId,
} from './handlers';

export const isOnHomePageResponseWithId = (
  result: OnHomePageResponse,
): result is OnHomePageResponseWithId => hasProperty(result, 'id');

export const isOnHomePageResponseWithContent = (
  result: OnHomePageResponse,
): result is OnHomePageResponseWithContent => hasProperty(result, 'content');
