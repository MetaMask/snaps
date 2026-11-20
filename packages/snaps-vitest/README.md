# @metamask/snaps-vitest

A Vitest environment and matchers for end-to-end testing MetaMask Snaps.

This package is a Vitest port of [`@metamask/snaps-jest`](../snaps-jest), and
provides the same end-to-end testing API:

- A Vitest environment that starts the built-in Snap server and exposes
  `installSnap()`.
- The Snaps matchers (`toRespondWith`, `toRespondWithError`,
  `toSendNotification`, `toRender`, `toTrackError`, `toTrackEvent`, and
  `toTrace`).
- The `installSnap`, `getMockAccount`, `getStateFromAccount`, and
  `getStateFromAsset` helpers.
- The Snap test types re-exported from `@metamask/snaps-simulation`.

## Setup

Add the preset to your `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import { getSnapsVitestConfig } from '@metamask/snaps-vitest';

export default defineConfig(
  getSnapsVitestConfig({
    globals: true,
  }),
);
```

Write tests as you would with `@metamask/snaps-jest`:

```ts
import { installSnap } from '@metamask/snaps-vitest';

describe('My Snap', () => {
  it('responds with bar', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'foo',
      params: ['bar'],
    });

    expect(response).toRespondWith('bar');
  });
});
```
