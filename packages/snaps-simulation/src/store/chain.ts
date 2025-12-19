import type { Hex } from '@metamask/utils';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { ApplicationState } from './store';

export type ChainState = {
  chainId: Hex;
};

/**
 * The initial chain state.
 */
const INITIAL_STATE: ChainState = {
  chainId: '0x1',
};

export const chainSlice = createSlice({
  name: 'chain',
  initialState: INITIAL_STATE,
  reducers: {
    setChain: (state, action: PayloadAction<Hex>) => {
      state.chainId = action.payload;
    },
  },
});

export const { setChain } = chainSlice.actions;

/**
 * Get the chain ID from the state.
 *
 * @param state - The application state.
 * @returns The chain ID.
 */
export const getChainId = (state: ApplicationState) => state.chain.chainId;
