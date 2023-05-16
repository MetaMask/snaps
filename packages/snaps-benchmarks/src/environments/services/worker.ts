import {
  AbstractExecutionService,
  WebWorkerExecutionService,
} from '@metamask/snaps-controllers';
import { createService } from '@metamask/snaps-controllers/test-utils';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    service: {
      service: AbstractExecutionService<unknown>;
    };
  }
}

if (!process.env.BENCHMARK_URL) {
  throw new Error('BENCHMARK_URL environment variable is not set.');
}

// In order to access the service from within the browser, we need to attach it
// to the window object.
window.service = createService(WebWorkerExecutionService, {
  documentUrl: new URL(`${process.env.BENCHMARK_URL}/environment`),
});
