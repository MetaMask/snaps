import type { Draft, PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export type HandlerSliceOptions<Request, Response> = {
  name: string;
  initialState: HandlerState<Request, Response>;
};

export type HistoryEntry<Request> = {
  date: Date;
  request: Request;
};

export type HandlerState<Request, Response> = {
  request: Request;
  response: Response | null;
  history: HistoryEntry<Request>[];
  pending?: boolean;
};

/**
 * Create a slice for a handler.
 *
 * @param options - Options for the slice.
 * @param options.name - The name of the slice.
 * @param options.initialState - The initial state of the slice.
 * @returns The slice.
 */
export function createHandlerSlice<Request, Response>({
  name,
  initialState,
}: HandlerSliceOptions<Request, Response>) {
  const slice = createSlice({
    name,
    initialState,
    reducers: {
      setRequest: (state, action: PayloadAction<Request>) => {
        // `immer` does not work well with generic types, so we have to cast.
        state.request = action.payload as Draft<Request>;
        state.history.push({
          date: new Date(),
          request: action.payload as Draft<Request>,
        });
        state.pending = true;
      },
      setRequestFromHistory: (state, action: PayloadAction<Request>) => {
        // `immer` does not work well with generic types, so we have to cast.
        state.request = action.payload as Draft<Request>;
      },
      setResponse: (state, action: PayloadAction<Response>) => {
        // `immer` does not work well with generic types, so we have to cast.
        state.response = action.payload as Draft<Response>;
        state.pending = false;
      },
      clearResponse: (state) => {
        state.response = null;
      },
    },
  });

  return slice;
}
