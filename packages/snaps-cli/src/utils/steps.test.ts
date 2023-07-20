import { dim } from 'chalk';
import ora from 'ora';

import { executeSteps } from './steps';

describe('executeSteps', () => {
  it('executes the steps in series', async () => {
    const steps = [
      {
        name: 'Step 1',
        task: jest.fn(),
      },
      {
        name: 'Step 2',
        task: jest.fn(),
      },
    ];

    await executeSteps(steps, {});

    expect(steps[0].task).toHaveBeenCalledTimes(1);
    expect(steps[1].task).toHaveBeenCalledTimes(1);
  });

  it('creates a spinner with the step name', async () => {
    const steps = [
      {
        name: 'Step 1',
        task: jest.fn(),
      },
    ];

    await executeSteps(steps, {});

    const mock = ora as jest.MockedFunction<typeof ora>;
    const spinner = mock.mock.results[0].value;

    expect(spinner.start).toHaveBeenCalledTimes(2);
    expect(spinner.start).toHaveBeenNthCalledWith(2, dim('Step 1'));

    expect(spinner.succeed).toHaveBeenCalledWith(
      expect.stringContaining('Done!'),
    );
  });

  it('passes the context to each step', async () => {
    const steps = [
      {
        name: 'Step 1',
        task: jest.fn(),
      },
    ];

    const context = {
      foo: 'bar',
    };

    await executeSteps(steps, context);

    expect(steps[0].task).toHaveBeenCalledWith({
      ...context,
      spinner: expect.any(Object),
    });
  });

  it('sets the exit code to 1 if a step throws an error', async () => {
    const log = jest.spyOn(console, 'error').mockImplementation();

    const steps = [
      {
        name: 'Step 1',
        task: jest.fn().mockRejectedValue(new Error('Oops!')),
      },
    ];

    await executeSteps(steps, {});

    expect(log).toHaveBeenCalledWith(expect.stringContaining('Oops!'));
    expect(process.exitCode).toBe(1);
  });
});
