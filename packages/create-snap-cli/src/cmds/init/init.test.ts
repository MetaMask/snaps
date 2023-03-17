import initModule from '.';
import * as initHandlerModule from './initHandler';
import * as initUtils from './initUtils';

describe('init module', () => {
  it('console logs if successful', async () => {
    const chdirMock = jest.spyOn(process, 'chdir').mockImplementation(() => {
      /* noop */
    });
    const mockArgv = { directory: 'foo', snapLocation: 'foo' };
    const initHandlerMock = jest
      .spyOn(initHandlerModule, 'initHandler')
      .mockImplementation(() => ({ ...(mockArgv as any) }));
    const buildMock = jest.spyOn(initUtils, 'buildSnap').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();

    await initModule.handler({ ...(mockArgv as any) });
    expect(initHandlerMock).toHaveBeenCalledWith(mockArgv);
    expect(chdirMock).toHaveBeenCalledTimes(1);
    expect(buildMock).toHaveBeenCalledWith('foo');
    expect(global.console.log).toHaveBeenCalledTimes(1);
  });
});
