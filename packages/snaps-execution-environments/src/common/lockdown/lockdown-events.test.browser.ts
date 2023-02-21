// eslint-disable-next-line import/unambiguous
import { expect } from '@wdio/globals';

import { executeLockdownEvents } from './lockdown-events';

describe('lockdown events security', () => {
  it('should lockdown events and made event properties inaccessible', async () => {
    executeLockdownEvents();

    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    const eventTarget = new EventTarget();
    eventTarget.addEventListener('just-test-event', (eventObject) => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(eventObject.composedPath).toBeUndefined();
      resolvePromise(true);
    });
    const testEvent = new Event('just-test-event');
    eventTarget.dispatchEvent(testEvent);
    await promise;
  });
});
