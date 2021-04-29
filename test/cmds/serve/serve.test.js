const EventEmitter = require('events');
const http = require('http');
const serveHandler = require('serve-handler');
const serve = require('../../../dist/src/cmds/serve');
const serveUtils = require('../../../dist/src/cmds/serve/serveUtils');
const fsUtils = require('../../../dist/src/utils/validate-fs');

const mockArgv = {
  root: '.',
  port: 8081,
};

jest.mock('serve-handler', () => jest.fn());

describe('serve', () => {
  describe('Starts a local, static HTTP server on the given port with the given root directory.', () => {
    let mockServer;

    beforeEach(() => {
      jest.spyOn(process, 'exit').mockImplementation(() => undefined);
      const logServerListeningMock = jest
        .spyOn(serveUtils, 'logServerListening')
        .mockImplementation();
      jest.spyOn(http, 'createServer').mockImplementation(() => {
        mockServer = new EventEmitter();
        mockServer.listen = () => logServerListeningMock();
        jest.spyOn(mockServer, 'on');
        jest.spyOn(mockServer, 'listen');
        return mockServer;
      });
      jest.spyOn(fsUtils, 'validateDirPath').mockImplementation(() => true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('server handles "close" event correctly', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      await serve.handler(mockArgv);
      const finishPromise = new Promise((resolve, _) => {
        mockServer.on('close', () => {
          expect(global.console.log).toHaveBeenCalledTimes(2);
          resolve();
        });
      });
      mockServer.emit('close');
      await finishPromise;
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('server handles "error" event correctly', async () => {
      jest.spyOn(console, 'log').mockImplementation();
      const logServerErrorMock = jest
        .spyOn(serveUtils, 'logServerError')
        .mockImplementation();
      jest.spyOn(process, 'exit').mockImplementation(() => undefined);

      await serve.handler(mockArgv);
      const finishPromise = new Promise((resolve, _) => {
        mockServer.on('error', () => {
          expect(global.console.log).toHaveBeenCalledTimes(1);
          expect(logServerErrorMock).toHaveBeenCalled();
          resolve();
        });
      });
      mockServer.emit('error');
      await finishPromise;
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('server handles "request" event correctly', async () => {
      let requestCallback;
      jest.spyOn(http, 'createServer').mockImplementationOnce((cb) => {
        requestCallback = cb;
        mockServer = new EventEmitter();
        mockServer.listen = () => undefined;
        jest.spyOn(mockServer, 'on');
        return mockServer;
      });

      jest.spyOn(console, 'log').mockImplementation();
      const logRequestMock = jest
        .spyOn(serveUtils, 'logRequest')
        .mockImplementation();

      await serve.handler(mockArgv);
      const finishPromise = new Promise((resolve, _) => {
        mockServer.on('request', (...args) => {
          expect(global.console.log).toHaveBeenCalledTimes(1);
          expect(logRequestMock).toHaveBeenCalled();
          requestCallback(...args);
          resolve();
        });
      });

      mockServer.emit('request', 'foo', 'bar');
      await finishPromise;
      expect(serveHandler).toHaveBeenCalledTimes(1);
      expect(serveHandler).toHaveBeenCalledWith('foo', 'bar', {
        public: '.',
        headers: [
          {
            source: '**/*',
            headers: [
              {
                key: 'Cache-Control',
                value: 'no-cache',
              },
            ],
          },
        ],
      });
    });
  });
});
