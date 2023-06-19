import { cli } from './cli';
import commands from './commands';

jest.mock('./cli');

describe('main', () => {
  it('executes the CLI application', async () => {
    const mock = cli as jest.MockedFunction<typeof cli>;
    mock.mockResolvedValue(undefined);

    await import('./main');

    expect(cli).toHaveBeenCalledTimes(1);
    expect(cli).toHaveBeenCalledWith(process.argv, commands);
  });
});
