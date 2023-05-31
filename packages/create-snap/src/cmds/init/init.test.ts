import { initCommand } from '.';
import * as initHandlerModule from './initHandler';

jest.mock('./initHandler');

describe('init module', () => {
  it('console logs if successful', async () => {
    const mockArgv = { directory: 'foo', snapLocation: 'foo' };
    const initHandlerMock = jest
      .spyOn(initHandlerModule, 'initHandler')
      .mockImplementation(() => ({ ...(mockArgv as any) }));
    jest.spyOn(console, 'log').mockImplementation();

    await initCommand.handler({ ...(mockArgv as any) });
    expect(initHandlerMock).toHaveBeenCalledWith(mockArgv);
    expect(global.console.log).toHaveBeenCalledTimes(1);
    expect(global.console.log).toHaveBeenCalledWith(
      '\nSnap project successfully initiated!',
    );
  });
});
