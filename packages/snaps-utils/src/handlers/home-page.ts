import { ComponentOrElementStruct } from '@metamask/snaps-sdk';
import { object, string, union } from '@metamask/superstruct';

export const OnHomePageResponseWithContentStruct = object({
  content: ComponentOrElementStruct,
});

export const OnHomePageResponseWithIdStruct = object({
  id: string(),
});

export const OnHomePageResponseStruct = union([
  OnHomePageResponseWithContentStruct,
  OnHomePageResponseWithIdStruct,
]);
