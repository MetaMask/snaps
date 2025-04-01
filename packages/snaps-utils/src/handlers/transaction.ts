import { ComponentOrElementStruct, SeverityLevel } from '@metamask/snaps-sdk';
import {
  literal,
  object,
  optional,
  string,
  assign,
  nullable,
  union,
} from '@metamask/superstruct';

export const OnTransactionSeverityResponseStruct = object({
  severity: optional(literal(SeverityLevel.Critical)),
});

export const OnTransactionResponseWithIdStruct = assign(
  OnTransactionSeverityResponseStruct,
  object({
    id: string(),
  }),
);

export const OnTransactionResponseWithContentStruct = assign(
  OnTransactionSeverityResponseStruct,
  object({
    content: ComponentOrElementStruct,
  }),
);

export const OnTransactionResponseStruct = nullable(
  union([
    OnTransactionResponseWithContentStruct,
    OnTransactionResponseWithIdStruct,
  ]),
);
