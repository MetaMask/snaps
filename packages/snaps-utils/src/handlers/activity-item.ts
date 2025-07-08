import { ComponentOrElementStruct } from '@metamask/snaps-sdk';
import {
  literal,
  object,
  optional,
  string,
  assign,
  nullable,
  union,
} from '@metamask/superstruct';

// Fix: Allow all severity levels, not just Critical
export const OnViewActivityItemSeverityResponseStruct = object({
  severity: optional(
    union([literal('critical'), literal('warning'), literal('info')]),
  ),
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

// Fix: Allow flexible combinations, not strict either/or
export const OnViewActivityItemResponseStruct = nullable(
  object({
    id: optional(string()),
    severity: optional(
      union([literal('critical'), literal('warning'), literal('info')]),
    ),
    content: optional(ComponentOrElementStruct),
  }),
);
