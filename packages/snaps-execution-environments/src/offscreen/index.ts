import { BrowserRuntimePostMessageStream } from '@metamask/post-message-stream';

import { executeLockdown } from '../common/lockdown/lockdown';
import { executeLockdownMore } from '../common/lockdown/lockdown-more';
import { OffscreenSnapExecutor } from './OffscreenSnapExecutor';

executeLockdown();
executeLockdownMore();

// The stream from the offscreen document to the execution service.
const parentStream = new BrowserRuntimePostMessageStream({
  name: 'child',
  target: 'parent',
});

OffscreenSnapExecutor.initialize(parentStream);
