const init = require('../../../dist/src/cmds/init');
const initializeModule = require('../../../dist/src/cmds/init/initHandler');
const buildModule = require('../../../dist/src/cmds/build');

describe('init module', () => {
  it('console logs if successful', async () => {
    const mockArgv = { foo: 'bar' };
    const initHandlerMock = jest.spyOn(initializeModule, 'initHandler').mockImplementation(() => mockArgv);
    const buildMock = jest.spyOn(buildModule, 'build').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();

    await init.handler({ ...mockArgv });
    expect(initHandlerMock).toHaveBeenCalledWith(mockArgv);
    expect(buildMock).toHaveBeenCalledWith({ foo: 'bar', manifest: false, eval: true });
    expect(global.console.log).toHaveBeenCalledTimes(2);
  });
});
