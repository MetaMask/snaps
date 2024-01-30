import { executeLockdownEvents } from '../common/lockdown/lockdown-events';
import { executeLockdownMore } from '../common/lockdown/lockdown-more';
import { ProxySnapExecutor } from '../proxy/ProxySnapExecutor';
import { ProxyMessageStream } from './ProxyMessageStream';

// Lockdown is already applied in LavaMoat
executeLockdownMore();
executeLockdownEvents();
/**
 * Set a stream of communication from the RN Webview Execution environment
 * to the mobile (caller) execution service webview's main window.
 */

const parentStream = new ProxyMessageStream({
  name: 'child', // webview
  target: 'parent', // rnside
  targetOrigin: '*',
  targetWindow: window.ReactNativeWebView,
});

ProxySnapExecutor.initialize(parentStream);
