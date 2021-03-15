const miscUtils = require('../../../dist/src/utils/misc');
const { logServerListening, logRequest, logServerError } = require('../../../dist/src/cmds/serve/serveUtils');

describe('serve utility functions', () => {
  describe('logServerListening', () => {

    afterEach(() => {
      jest.restoreAllMocks();
    });

    const portInput = 8000;

    it('logs to console', async () => {
      jest.spyOn(console, 'log').mockImplementation();
      logServerListening(portInput);
      expect(global.console.log).toHaveBeenCalledTimes(1);
    });
  });

  describe('logRequest', () => {

    afterEach(() => {
      jest.restoreAllMocks();
    });

    const requestInput = {
      url: 'http://localhost:8000',
    };

    it('logs to console', async () => {
      jest.spyOn(console, 'log').mockImplementation();
      logRequest(requestInput);
      expect(global.console.log).toHaveBeenCalledTimes(1);
    });

  });

  describe('logServerError', () => {

    afterEach(() => {
      jest.restoreAllMocks();
    });

    const port = 8000;

    it('logs already in use error to console', async () => {
      const mockError = new Error('error message');
      mockError.code = 'EADDRINUSE';
      jest.spyOn(miscUtils, 'logError').mockImplementation();
      logServerError(mockError, port);
      expect(miscUtils.logError).toHaveBeenCalledTimes(1);
    });

    it('logs server error to console', async () => {
      const mockBadError = new Error('error message');
      mockBadError.code = 'fake';
      jest.spyOn(miscUtils, 'logError').mockImplementation();
      logServerError(mockBadError, port);
      expect(miscUtils.logError).toHaveBeenCalledTimes(1);
    });
  });
});
