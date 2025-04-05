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
};

export const historyAtom = atomWithStorage<HistoryEntry[]>('history', []);

/**
 * The Jotai store which contains the state of all atoms.
 */
export const store = createStore();
