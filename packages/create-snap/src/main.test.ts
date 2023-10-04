import { cli } from './cli';

jest.mock('./cli');

describe('main', () => {
  it('executes the CLI application', async () => {
    const mock = cli as jest.MockedFunction<typeof cli>;
    mock.mockRejectedValue('foo');

    jest.spyOn(console, 'error').mockImplementation();

    await import('./main');

    expect(cli).toHaveBeenCalledTimes(1);
    expect(cli).toHaveBeenCalledWith(process.argv);
    expect(process.exitCode).toBe(1);

    // Reset the exit code so that the test doesn't fail.
    process.exitCode = 0;
  });
});
