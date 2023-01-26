import { logError, logInfo } from '@metamask/snaps-utils';

import { logServerListening, logRequest, logServerError } from './serveUtils';

jest.mock('@metamask/snaps-utils', () => ({
  ...jest.requireActual('@metamask/snaps-utils'),
  logInfo: jest.fn(),
  logError: jest.fn(),
}));

describe('serve utility functions', () => {
  describe('logServerListening', () => {
    const portInput = 8000;

    it('logs to console', () => {
      logServerListening(portInput);
      expect(logInfo).toHaveBeenCalledTimes(1);
    });
  });

  describe('logRequest', () => {
    const requestInput = {
      url: 'http://localhost:8000',
    };

    it('logs to console', () => {
      logRequest(requestInput);
      expect(logInfo).toHaveBeenCalledTimes(1);
    });
  });

  describe('logServerError', () => {
    const port = 8000;

    it('logs already in use error to console', () => {
      const mockError: Error & { code?: string } = new Error('error message');
      mockError.code = 'EADDRINUSE';
      logServerError(mockError, port);
      expect(logError).toHaveBeenCalledTimes(1);
    });

    it('logs server error to console', () => {
      const mockBadError: Error & { code?: string } = new Error(
        'error message',
      );
      mockBadError.code = 'fake';
      logServerError(mockBadError, port);
      expect(logError).toHaveBeenCalledTimes(1);
    });
  });
});
