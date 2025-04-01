import type {
  OnAssetsConversionHandler,
  OnAssetsLookupHandler,
  OnCronjobHandler,
  OnHomePageHandler,
  OnInstallHandler,
  OnKeyringRequestHandler,
  OnNameLookupHandler,
  OnProtocolRequestHandler,
  OnRpcRequestHandler,
  OnSettingsPageHandler,
  OnSignatureHandler,
  OnTransactionHandler,
  OnUpdateHandler,
  OnUserInputHandler,
} from '@metamask/snaps-sdk';

import { HandlerType } from './types';

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
  [HandlerType.OnSettingsPage]: {
    type: HandlerType.OnSettingsPage,
    required: true,
    validator: (snapExport: unknown): snapExport is OnSettingsPageHandler => {
      return typeof snapExport === 'function';
    },
  },
  [HandlerType.OnSignature]: {
    type: HandlerType.OnSignature,
    required: true,
    validator: (snapExport: unknown): snapExport is OnSignatureHandler => {
      return typeof snapExport === 'function';
    },
  },
  [HandlerType.OnUserInput]: {
    type: HandlerType.OnUserInput,
    required: false,
    validator: (snapExport: unknown): snapExport is OnUserInputHandler => {
      return typeof snapExport === 'function';
    },
  },
  [HandlerType.OnAssetsLookup]: {
    type: HandlerType.OnAssetsLookup,
    required: true,
    validator: (snapExport: unknown): snapExport is OnAssetsLookupHandler => {
      return typeof snapExport === 'function';
    },
  },
  [HandlerType.OnAssetsConversion]: {
    type: HandlerType.OnAssetsConversion,
    required: true,
    validator: (
      snapExport: unknown,
    ): snapExport is OnAssetsConversionHandler => {
      return typeof snapExport === 'function';
    },
  },
  [HandlerType.OnProtocolRequest]: {
    type: HandlerType.OnProtocolRequest,
    required: true,
    validator: (
      snapExport: unknown,
    ): snapExport is OnProtocolRequestHandler => {
      return typeof snapExport === 'function';
    },
  },
} as const;

export const SNAP_EXPORT_NAMES = Object.values(HandlerType);
