import { IframeExecutionService } from '@metamask/snaps-controllers';
import { createService } from '@metamask/snaps-controllers/test-utils';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    service: ReturnType<typeof createService>;
  }
}

window.service = createService(IframeExecutionService);
