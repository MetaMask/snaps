import { ComponentOrElementStruct, SeverityLevel } from '@metamask/snaps-sdk';
import {
  literal,
  object,
  optional,
  string,
  assign,
  nullable,
} from '@metamask/superstruct';

export const OnViewActivityItemSeverityResponseStruct = object({
  severity: optional(literal(SeverityLevel.Critical)),
});

export const OnViewActivityItemResponseWithIdStruct = assign(
  OnViewActivityItemSeverityResponseStruct,
  object({
    id: string(),
  }),
);

export const OnViewActivityItemResponseWithContentStruct = assign(
  OnViewActivityItemSeverityResponseStruct,
  object({
    content: ComponentOrElementStruct,
  }),
);

export const OnViewActivityItemResponseStruct = nullable(
  object({
    id: optional(string()),
    severity: optional(literal(SeverityLevel.Critical)),
    content: optional(ComponentOrElementStruct),
  }),
);
