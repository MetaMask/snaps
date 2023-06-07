import {
  ApplicationState,
  Dispatch,
} from '@metamask/snaps-simulator/src/store';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __SIMULATOR_API__: {
      dispatch: Dispatch;
      subscribe: (listener: () => void) => () => void;
      getState: () => ApplicationState;
      getRequestId: () => string;
      getNotifications: (
        requestId: string,
      ) => { id: string; message: string }[];
    };
  }
}

export {};
