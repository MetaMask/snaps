import type { NotificationType } from '@metamask/rpc-methods';
import type { ApplicationState, Dispatch } from '@metamask/snaps-simulator';
import type { EnumToUnion } from '@metamask/snaps-utils';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    // This API is injected into the page by the simulator. It allows us to
    // dispatch actions to the simulator, and read the state directly from the
    // Redux store.
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __SIMULATOR_API__: {
      dispatch: Dispatch;
      subscribe: (listener: () => void) => () => void;
      getState: () => ApplicationState;
      getRequestId: () => string;
      getNotifications: (requestId: string) => {
        id: string;
        message: string;
        type: EnumToUnion<NotificationType>;
      }[];
    };
  }
}

export {};
