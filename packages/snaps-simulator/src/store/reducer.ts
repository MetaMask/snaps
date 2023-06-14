import { HandlerType } from '@metamask/snaps-utils';
import { combineReducers } from '@reduxjs/toolkit';

// We have to import the reducers like this to avoid circular dependencies.
import { configuration } from '../features/configuration/slice';
import { console } from '../features/console/slice';
import { cronjob } from '../features/handlers/cronjobs/slice';
import { jsonRpc } from '../features/handlers/json-rpc/slice';
import { transactions } from '../features/handlers/transactions/slice';
import { manifest } from '../features/manifest/slice';
import { notifications } from '../features/notifications/slice';
import { simulation } from '../features/simulation/slice';

export const reducer = combineReducers({
  configuration,
  console,
  manifest,
  notifications,
  simulation,
  [HandlerType.OnRpcRequest]: jsonRpc,
  [HandlerType.OnCronjob]: cronjob,
  [HandlerType.OnTransaction]: transactions,
});
