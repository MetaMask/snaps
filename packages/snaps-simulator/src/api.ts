import { assert } from '@metamask/utils';
import type { Store } from 'redux';

import type { Notification } from './features';
import type { ApplicationState } from './store';
import { IS_TEST_BUILD } from './utils';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    // eslint-disable-next-line @typescript-eslint/naming-convention
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
export function setWindowApi(store: Store<ApplicationState>) {
  assert(IS_TEST_BUILD, 'This function should only be called in a test build.');

  window.__SIMULATOR_API__ = {
    dispatch: store.dispatch,
    subscribe: store.subscribe.bind(store),
    getState: () => store.getState(),
    getRequestId: () => store.getState().simulation.requestId,
    getNotifications: (requestId: string) => {
      const state = store.getState();
      return state.notifications.allNotifications.filter(
        (notification) => notification.id === requestId,
      );
    },
  };
}
