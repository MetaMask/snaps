import { ControllerMessenger } from '@metamask/base-controller';
import { JsonRpcEngine } from 'json-rpc-engine';
import { createEngineStream } from 'json-rpc-middleware-stream';
import pump from 'pump';

import { setupMultiplex } from '../../AbstractExecutionService';
import { IframeExecutionService } from '../IframeExecutionService';

declare global {
  interface Window {
    /* eslint-disable @typescript-eslint/naming-convention */
    createEngineStream: typeof createEngineStream;
    pump: typeof pump;
    setupMultiplex: typeof setupMultiplex;
    ControllerMessenger: typeof ControllerMessenger;
    IframeExecutionService: typeof IframeExecutionService;
    JsonRpcEngine: typeof JsonRpcEngine;
    /* eslint-enable @typescript-eslint/naming-convention */
  }
}

// We expose a bunch of globals here because we're running this code in a
// browser, and we don't have access to any non-browser globals. This is used
// in the `IframeExecutionService.test.browser.ts` test.
window.createEngineStream = createEngineStream;
window.pump = pump;
window.setupMultiplex = setupMultiplex;
window.ControllerMessenger = ControllerMessenger;
window.IframeExecutionService = IframeExecutionService;
window.JsonRpcEngine = JsonRpcEngine;
