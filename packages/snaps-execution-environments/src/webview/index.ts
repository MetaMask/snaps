import { executeLockdownEvents } from '../common/lockdown/lockdown-events';
import { executeLockdownMore } from '../common/lockdown/lockdown-more';
import { ProxySnapExecutor } from '../proxy/ProxySnapExecutor';
import { WebViewExecutorStream } from './WebViewExecutorStream';

// Lockdown is already applied in LavaMoat
executeLockdownMore();
executeLockdownEvents();

const parentStream = new WebViewExecutorStream({
  name: 'child', // webview
  target: 'parent', // rnside
  targetWindow: window.ReactNativeWebView,
});

ProxySnapExecutor.initialize(parentStream);
