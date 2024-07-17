import type { SimulationOptions } from '../options';
/**
 * Create a Redux store.
 *
 * @param options - The simulation options.
 * @param options.state - The initial state for the Snap.
 * @param options.unencryptedState - The initial unencrypted state for the Snap.
 * @returns A Redux store with the default state.
 */
export declare function createStore({ state, unencryptedState }: SimulationOptions): {
    store: import("@reduxjs/toolkit/dist/configureStore").ToolkitStore<{
        mocks: import("./mocks").MocksState;
        notifications: import("./notifications").NotificationsState;
        state: import("./state").State;
        ui: import("./ui").UiState;
    }, import("redux").AnyAction, import("@reduxjs/toolkit").MiddlewareArray<[import("redux-saga").SagaMiddleware<object>]>>;
    runSaga: <S extends import("redux-saga").Saga<any[]>>(saga: S, ...args: Parameters<S>) => import("redux-saga").Task<any>;
};
export declare type Store = ReturnType<typeof createStore>['store'];
export declare type ApplicationState = ReturnType<Store['getState']>;
export declare type RunSagaFunction = ReturnType<typeof createStore>['runSaga'];
