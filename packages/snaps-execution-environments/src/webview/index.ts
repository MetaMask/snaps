import { BrowserRuntimePostMessageStream } from '@metamask/post-message-stream';

import { executeLockdownEvents } from '../common/lockdown/lockdown-events';
import { executeLockdownMore } from '../common/lockdown/lockdown-more';
import { WebviewSnapExecutor } from './WebviewSnapExecutor';

// Lockdown is already applied in LavaMoat
executeLockdownMore();
executeLockdownEvents();

// The stream from the RN Webview document to the mobile (caller) execution service.
const parentStream = new BrowserRuntimePostMessageStream({
  name: 'child',
  target: 'parent',
});

WebviewSnapExecutor.initialize(parentStream);
