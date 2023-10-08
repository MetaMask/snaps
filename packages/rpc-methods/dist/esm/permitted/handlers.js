import { getSnapsHandler } from './getSnaps';
import { invokeKeyringHandler } from './invokeKeyring';
import { invokeSnapSugarHandler } from './invokeSnapSugar';
import { requestSnapsHandler } from './requestSnaps';
/* eslint-disable @typescript-eslint/naming-convention */ export const methodHandlers = {
    wallet_getSnaps: getSnapsHandler,
    wallet_requestSnaps: requestSnapsHandler,
    wallet_invokeSnap: invokeSnapSugarHandler,
    wallet_invokeKeyring: invokeKeyringHandler
};
/* eslint-enable @typescript-eslint/naming-convention */ export const handlers = Object.values(methodHandlers);

//# sourceMappingURL=handlers.js.map