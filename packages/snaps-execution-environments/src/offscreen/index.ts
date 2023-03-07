import { BrowserRuntimePostMessageStream } from '@metamask/post-message-stream';

import { executeLockdownMore } from '../common/lockdown/lockdown-more';
import { OffscreenSnapExecutor } from './OffscreenSnapExecutor';

// Lockdown is already applied in LavaMoat
executeLockdownMore();

// The stream from the offscreen document to the execution service.
const parentStream = new BrowserRuntimePostMessageStream({
  name: 'child',
  target: 'parent',
});

OffscreenSnapExecutor.initialize(parentStream);
