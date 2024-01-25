import { createService } from '../../test-utils';
import { WebViewExecutionService } from './WebViewExecutionService';

class WebViewExecutionServiceWrapper extends WebViewExecutionService {
  public async testInitEnvStream(jobId: string) {
    return this.initEnvStream(jobId);
  }
}

const mockedWebView = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  injectJavaScript: jest.fn(),
};

describe('WebViewExecutionService', () => {
  jest.useRealTimers();

  beforeEach(() => {
    mockedWebView.addEventListener.mockReset();
  });

  it('can boot', async () => {
    const { service } = createService(WebViewExecutionServiceWrapper, {
      getWebView: async () => Promise.resolve(mockedWebView),
    });

    expect(service).toBeDefined();
  });
});
