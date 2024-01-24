import { createService } from '../../test-utils';
import { WebviewExecutionService } from './WebviewExecutionService';

class WebviewExecutionServiceWrapper extends WebviewExecutionService {
  public async testInitEnvStream(jobId: string) {
    return this.initEnvStream(jobId);
  }
}

const mockedWebView = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  injectJavaScript: jest.fn(),
};

jest.mock('./WebViewMessageStream', () => ({
  WebViewMessageStream: jest.fn().mockImplementation(() => ({
    webView: mockedWebView,
  })),
}));

describe('WebviewExecutionService', () => {
  jest.useRealTimers();

  beforeEach(() => {
    mockedWebView.addEventListener.mockReset();
  });

  it('can boot', async () => {
    const { service } = createService(WebviewExecutionServiceWrapper, {
      getWebView: async () => Promise.resolve(mockedWebView),
    });

    expect(service).toBeDefined();
  });
});
