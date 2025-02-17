import { expect } from '@wdio/globals';

import { executeLockdownEvents } from './lockdown-events';

describe('lockdown events security', () => {
  it('should lockdown events and made event properties inaccessible', async () => {
    executeLockdownEvents();

    const eventTarget = new EventTarget();

    const promise = new Promise((resolve) => {
      eventTarget.addEventListener('just-test-event', (eventObject) => {
        resolve(eventObject.composedPath);
      });
    });

    const testEvent = new Event('just-test-event');
    eventTarget.dispatchEvent(testEvent);

    const result = await promise;
    expect(result).toBeUndefined();
  });
});
