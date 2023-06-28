import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { baseApi } from './api';

const createStore = () => {
  const store = configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });

  setupListeners(store.dispatch);

  return store;
};

export type ApplicationState = ReturnType<
  ReturnType<typeof createStore>['getState']
>;

export type ApplicationDispatch = ReturnType<typeof createStore>['dispatch'];

export default createStore;
