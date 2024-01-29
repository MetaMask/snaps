import { createService } from '../../test-utils';
import { WebViewExecutionService } from './WebViewExecutionService';
import type { WebViewInterface } from './WebViewMessageStream';

class WebViewExecutionServiceWrapper extends WebViewExecutionService {
  public async testInitEnvStream(jobId: string) {
    return this.initEnvStream(jobId);
  }
}

const mockedWebView = {
  unregisterMessageListener: jest.fn(),
  registerMessageListener: jest.fn(),
  injectJavaScript: jest.fn(),
};

describe('WebViewExecutionService', () => {
  it('can boot', async () => {
    const { service } = createService(WebViewExecutionServiceWrapper, {
      getWebView: async () =>
        Promise.resolve(mockedWebView as unknown as WebViewInterface),
    });

    expect(service).toBeDefined();
  });
});
