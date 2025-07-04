import type {
  OnAssetHistoricalPriceHandler,
  OnAssetsConversionHandler,
  OnAssetsLookupHandler,
  OnAssetsMarketDataHandler,
  OnClientRequestHandler,
  OnCronjobHandler,
  OnHomePageHandler,
  OnInstallHandler,
  OnKeyringRequestHandler,
  OnNameLookupHandler,
  OnProtocolRequestHandler,
  OnRpcRequestHandler,
  OnSettingsPageHandler,
  OnSignatureHandler,
  OnStartHandler,
  OnTransactionHandler,
  OnUpdateHandler,
  OnUserInputHandler,
  OnWebSocketEventHandler,
} from '@metamask/snaps-sdk';

import { HandlerType } from './types';
import type { OnViewActivityItemHandler } from '../../../snaps-sdk/src/types/handlers/activity-item';

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
  [HandlerType.OnViewActivityItem]: {
    type: HandlerType.OnViewActivityItem,
    required: true,
    validator: (
      snapExport: unknown,
    ): snapExport is OnViewActivityItemHandler => {
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
  [HandlerType.OnStart]: {
    type: HandlerType.OnStart,
    required: false,
    validator: (snapExport: unknown): snapExport is OnStartHandler => {
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
  [HandlerType.OnAssetHistoricalPrice]: {
    type: HandlerType.OnAssetHistoricalPrice,
    required: true,
    validator: (
      snapExport: unknown,
    ): snapExport is OnAssetHistoricalPriceHandler => {
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
  [HandlerType.OnAssetsMarketData]: {
    type: HandlerType.OnAssetsMarketData,
    required: true,
    validator: (
      snapExport: unknown,
    ): snapExport is OnAssetsMarketDataHandler => {
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
  [HandlerType.OnClientRequest]: {
    type: HandlerType.OnClientRequest,
    required: true,
    validator: (snapExport: unknown): snapExport is OnClientRequestHandler => {
      return typeof snapExport === 'function';
    },
  },
  [HandlerType.OnWebSocketEvent]: {
    type: HandlerType.OnWebSocketEvent,
    required: true,
    validator: (snapExport: unknown): snapExport is OnWebSocketEventHandler => {
      return typeof snapExport === 'function';
    },
  },
} as const;

export const SNAP_EXPORT_NAMES = Object.values(HandlerType);
