import { Store } from 'redux';

import { ApplicationState } from './store';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __SIMULATOR_API__: {
      getState: () => ApplicationState;
    };
  }
}

/**
 * Sets the window API. This is useful for automated testing.
 *
 * @param store - The store.
 */
export function setWindowApi(store: Store<ApplicationState>) {
  window.__SIMULATOR_API__ = {
    getState: () => store.getState(),
  };
}
