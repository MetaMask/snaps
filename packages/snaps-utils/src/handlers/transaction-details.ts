import { ComponentOrElementStruct, SeverityLevel } from '@metamask/snaps-sdk';
import {
  literal,
  object,
  optional,
  string,
  assign,
  nullable,
} from '@metamask/superstruct';

export const OnTransactionDetailsSeverityResponseStruct = object({
  severity: optional(literal(SeverityLevel.Critical)),
});

export const OnTransactionDetailsResponseWithIdStruct = assign(
  OnTransactionDetailsSeverityResponseStruct,
  object({
    id: string(),
  }),
);

export const OnTransactionDetailsResponseWithContentStruct = assign(
  OnTransactionDetailsSeverityResponseStruct,
  object({
    content: ComponentOrElementStruct,
  }),
);

export const OnTransactionDetailsResponseStruct = nullable(
  object({
    id: optional(string()),
    severity: optional(literal(SeverityLevel.Critical)),
    content: optional(ComponentOrElementStruct),
  }),
);
