import { atom, createStore } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { SAMPLE_JSON_RPC_REQUEST } from './constants.js';
import { getSnapsProvider } from './utils.js';

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
 * The `historyAtom` is a Jotai atom that stores the history of JSON-RPC
 * requests made by the user.
 */
export const historyAtom = atom(
  (get) => get(persistedHistoryAtom),
  (get, set, action: HistoryAction) => {
    const history = get(persistedHistoryAtom);

    switch (action.type) {
      case 'add':
        set(persistedHistoryAtom, [action.payload, ...history]);
        break;

      case 'remove':
        set(
          persistedHistoryAtom,
          history.filter((entry) => entry.id !== action.payload.id),
        );
        break;

      case 'update':
        set(
          persistedHistoryAtom,
          history.map((entry) =>
            entry.id === action.payload.id ? action.payload : entry,
          ),
        );
        break;

      default:
        break;
    }
  },
);

/**
 * The Jotai store which contains the state of all atoms.
 */
export const store = createStore();
