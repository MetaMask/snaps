import EventEmitter from 'events';
import http from 'http';
import serveHandler from 'serve-handler';
import * as fsUtils from '../../utils/validate-fs';
import * as serveUtils from './serveUtils';
import serve from '.';

const getMockArgv = () =>
  ({
    root: '.',
    port: 8081,
  } as any);

jest.mock('serve-handler', () => jest.fn());

interface MockServer extends EventEmitter {
  listen: ({ port }: { port: string }, callback: () => void) => void;
}

function getMockServer(): MockServer {
  const server: MockServer = new EventEmitter() as any;
  server.listen = (_port, callback) => callback();
  jest.spyOn(server, 'on');
  jest.spyOn(server, 'listen');
  return server;
}

describe('serve', () => {
  describe('Starts a local, static HTTP server on the given port with the given root directory.', () => {
    let mockServer: MockServer;

    beforeEach(() => {
      jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      jest.spyOn(serveUtils, 'logServerListening').mockImplementation();
      jest.spyOn(http, 'createServer').mockImplementation(() => {
        mockServer = getMockServer();
        return mockServer as any;
      });
      jest
        .spyOn(fsUtils, 'validateDirPath')
        .mockImplementation(async () => true);
    });

    it('server handles "close" event correctly', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      await serve.handler(getMockArgv());
      const finishPromise = new Promise<void>((resolve, _) => {
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
      jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

      await serve.handler(getMockArgv());
      const finishPromise = new Promise<void>((resolve, _) => {
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
      let requestCallback: (...args: any[]) => any;

      jest.spyOn(serveUtils, 'logServerListening').mockImplementation();
      jest.spyOn(http, 'createServer').mockImplementationOnce((cb: any) => {
        requestCallback = cb;
        mockServer = getMockServer();
        return mockServer as any;
      });

      jest.spyOn(console, 'log').mockImplementation();
      const logRequestMock = jest
        .spyOn(serveUtils, 'logRequest')
        .mockImplementation();

      await serve.handler(getMockArgv());
      const finishPromise = new Promise<void>((resolve, _) => {
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
