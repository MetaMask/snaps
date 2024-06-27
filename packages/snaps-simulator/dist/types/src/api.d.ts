import type { Store } from 'redux';
import type { Notification } from './features';
import type { ApplicationState } from './store';
declare global {
    interface Window {
        __SIMULATOR_API__: {
            dispatch: Store<ApplicationState>['dispatch'];
            subscribe: Store<ApplicationState>['subscribe'];
            getState: () => ApplicationState;
            getRequestId: () => string | undefined;
            getNotifications: (requestId: string) => Notification[];
        };
    }
}
/**
 * Sets the window API. This is useful for automated testing.
 *
 * @param store - The store.
 */
export declare function setWindowApi(store: Store<ApplicationState>): void;
