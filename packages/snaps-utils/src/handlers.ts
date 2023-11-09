import type {
  OnCronjobHandler,
  OnHomePageHandler,
  OnInstallHandler,
  OnKeyringRequestHandler,
  OnNameLookupHandler,
  OnRpcRequestHandler,
  OnTransactionHandler,
  OnUpdateHandler,
} from '@metamask/snaps-sdk';
import { SeverityLevel } from '@metamask/snaps-sdk';
import { ComponentStruct } from '@metamask/snaps-ui';
import { literal, object, optional } from 'superstruct';

import type { SnapHandler } from './handler-types';
import { HandlerType } from './handler-types';

export type SnapRpcHookArgs = {
  origin: string;
  handler: HandlerType;
  request: Record<string, unknown>;
};

export const SNAP_EXPORTS = {
  [HandlerType.OnRpcRequest]: {
    type: HandlerType.OnRpcRequest,
    required: true,
    validator: (snapExport: unknown): snapExport is OnRpcRequestHandler => {
      return typeof snapExport === 'function';
    },
  },
  [HandlerType.OnTransaction]: {
    type: HandlerType.OnTransaction,
    required: true,
    validator: (snapExport: unknown): snapExport is OnTransactionHandler => {
      return typeof snapExport === 'function';
    },
  },
  [HandlerType.OnCronjob]: {
    type: HandlerType.OnCronjob,
    required: true,
    validator: (snapExport: unknown): snapExport is OnCronjobHandler => {
      return typeof snapExport === 'function';
    },
  },
  [HandlerType.OnNameLookup]: {
    type: HandlerType.OnNameLookup,
    required: true,
    validator: (snapExport: unknown): snapExport is OnNameLookupHandler => {
      return typeof snapExport === 'function';
    },
  },
  [HandlerType.OnInstall]: {
    type: HandlerType.OnInstall,
    required: false,
    validator: (snapExport: unknown): snapExport is OnInstallHandler => {
      return typeof snapExport === 'function';
    },
  },
  [HandlerType.OnUpdate]: {
    type: HandlerType.OnUpdate,
    required: false,
    validator: (snapExport: unknown): snapExport is OnUpdateHandler => {
      return typeof snapExport === 'function';
    },
  },
  [HandlerType.OnKeyringRequest]: {
    type: HandlerType.OnKeyringRequest,
    required: true,
    validator: (snapExport: unknown): snapExport is OnKeyringRequestHandler => {
      return typeof snapExport === 'function';
    },
  },
  [HandlerType.OnHomePage]: {
    type: HandlerType.OnHomePage,
    required: true,
    validator: (snapExport: unknown): snapExport is OnHomePageHandler => {
      return typeof snapExport === 'function';
    },
  },
} as const;

export const OnTransactionResponseStruct = object({
  content: ComponentStruct,
  severity: optional(literal(SeverityLevel.Critical)),
});

export const OnHomePageResponseStruct = object({
  content: ComponentStruct,
});

/**
 * Utility type for getting the handler function type from a handler type.
 */
export type HandlerFunction<Type extends SnapHandler> =
  Type['validator'] extends (snapExport: unknown) => snapExport is infer Handler
    ? Handler
    : never;

/**
 * All the function-based handlers that a snap can implement.
 */
export type SnapFunctionExports = {
  [Key in keyof typeof SNAP_EXPORTS]?: HandlerFunction<
    (typeof SNAP_EXPORTS)[Key]
  >;
};

/**
 * All handlers that a snap can implement.
 */
export type SnapExports = SnapFunctionExports;
