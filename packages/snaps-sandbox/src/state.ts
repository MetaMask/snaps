import { assertExhaustive } from '@metamask/utils';
import deepEqual from 'fast-deep-equal';
import { atom, createStore } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { SAMPLE_JSON_RPC_REQUEST } from './constants.js';
import { getSnapsProvider } from './utils.js';

/**
 * The settings for the sandbox.
 */
export type Settings = {
  /**
   * The Snap ID of the Snap to be invoked.
   */
  snapId?: string | null;

  /**
   * Whether the current Snap ID should be used. If this is set to `true`, the
   * `snapId` property will be ignored.
   */
  useCurrentSnapId?: boolean;
};

/**
 * The settings atom is a Jotai atom that stores the settings for the sandbox in
 * local storage.
 */
export const settingsAtom = atomWithStorage<Settings>('settings', {
  snapId: null,
  useCurrentSnapId: true,
});

/**
 * The MetaMask JSON-RPC provider.
 */
export const providerAtom = atom(getSnapsProvider());

/**
 * The current JSON-RPC request made by the user.
 */
export const requestAtom = atomWithStorage('request', SAMPLE_JSON_RPC_REQUEST);

/**
 * `HistoryEntry` represents a single entry in the history, i.e., the previous
 * request made by the user.
 */
export type HistoryEntry = {
  /**
   * The unique ID of the request.
   */
  id: string;

  /**
   * The title of the request.
   */
  title: string;

  /**
   * The JSON-RPC request made by the user.
   */
  request: string;

  /**
   * The unix timestamp of when the request was made.
   */
  timestamp: number;

  /**
   * Whether the request is a favorite.
   */
  favorite?: boolean;
};

/**
 * The `HistoryAction` type represents an action that can be performed on the
 * history atom.
 */
type HistoryAction = {
  /**
   * The action type.
   */
  type: 'add' | 'remove' | 'update';

  /**
   * The payload of the action.
   */
  payload: HistoryEntry;
};

/**
 * The `persistedHistoryAtom` is a Jotai atom that stores the history of
 * JSON-RPC requests made by the user in local storage. This should not be used
 * directly, but rather through the {@link historyAtom} which provides a more
 * convenient API.
 */
export const persistedHistoryAtom = atomWithStorage<HistoryEntry[]>(
  'history',
  [],
);

/**
 * A reducer function that handles actions for the history atom. It takes the
 * current history and an action, and returns the new history.
 *
 * @param history - The current history.
 * @param action - The action to perform on the history.
 * @returns The new history.
 */
function reduce(history: HistoryEntry[], action: HistoryAction) {
  switch (action.type) {
    case 'add': {
      const parsedRequest = JSON.parse(action.payload.request);
      const existingEntry = history.find((entry) => {
        const json = JSON.parse(entry.request);
        return deepEqual(json, parsedRequest);
      });

      // If an existing entry is found, update the timestamp instead of adding
      // a new entry.
      if (existingEntry) {
        return reduce(history, {
          type: 'update',
          payload: {
            ...existingEntry,
            timestamp: action.payload.timestamp,
          },
        });
      }

      return [action.payload, ...history];
    }

    case 'remove':
      return history.filter((entry) => entry.id !== action.payload.id);

    case 'update':
      return history.map((entry) =>
        entry.id === action.payload.id ? action.payload : entry,
      );

    default:
      return assertExhaustive(action.type);
  }
}

/**
 * The `historyAtom` is a Jotai atom that stores the history of JSON-RPC
 * requests made by the user.
 */
export const historyAtom = atom(
  (get) => get(persistedHistoryAtom),
  (get, set, action: HistoryAction) => {
    const history = get(persistedHistoryAtom);
    const newHistory = reduce(history, action);

    set(persistedHistoryAtom, newHistory);
  },
);

/**
 * The Jotai store which contains the state of all atoms.
 */
export const store = createStore();
