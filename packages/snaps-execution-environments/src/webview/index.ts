/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/naming-convention */
import { WindowPostMessageStream } from '@metamask/post-message-stream';

import { executeLockdownEvents } from '../common/lockdown/lockdown-events';
import { executeLockdownMore } from '../common/lockdown/lockdown-more';
import { WebviewSnapExecutor } from './WebviewSnapExecutor';

// Lockdown is already applied in LavaMoat
executeLockdownMore();
executeLockdownEvents();

declare global {
  interface Window {
    ReactNativeWebView: any;
  }
}

// Set a stream from the RN Webview Execution environment to the mobile (caller) execution service.
const parentStream = new WindowPostMessageStream({
  name: 'child', // webview
  target: 'parent', // rnside
  targetOrigin: '*',
  targetWindow: window.ReactNativeWebView,
});

WebviewSnapExecutor.initialize(parentStream);