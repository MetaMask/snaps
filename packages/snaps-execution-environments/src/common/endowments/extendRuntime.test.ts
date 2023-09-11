import extendRuntime, {
  MIN_RUNTIME_EXTEND,
  MAX_RUNTIME_EXTEND,
  TimerAction,
} from './extendRuntime';

describe('extendRuntime endowment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has expected properties', () => {
    expect(extendRuntime).toMatchObject({
      names: ['extendRuntime'],
      factory: expect.any(Function),
    });
  });

  it('has expected factory output', () => {
    const mockNotify = jest.fn();
    expect(extendRuntime.factory(mockNotify)).toMatchObject({
      extendRuntime: expect.any(Function),
    });
  });

  it('should properly notify the timer and execute callback', async () => {
    const mockNotify = jest.fn();
    let callbackExecuted = false;
    const mockCallback = () => {
      callbackExecuted = true;
    };
    const extendRuntimeEndowment =
      extendRuntime.factory(mockNotify).extendRuntime;

    await extendRuntimeEndowment(mockCallback, { timeWait: 30 });

    expect(callbackExecuted).toBe(true);
    expect(mockNotify).toHaveBeenCalledWith({
      method: 'ExecutionTimerRequest',
      params: {
        timeWait: 30,
        timerAction: TimerAction.Pause,
      },
    });
    expect(mockNotify).toHaveBeenCalledWith({
      method: 'ExecutionTimerRequest',
      params: {
        timerAction: TimerAction.Resume,
      },
    });
  });

  it('should be idempotent if called several times sequentially with same input', async () => {
    const mockNotify = jest.fn();
    let callbackExecuted = false;
    const mockCallback = () => {
      callbackExecuted = true;
      return 'final-result-mock';
    };
    const extendRuntimeEndowment =
      extendRuntime.factory(mockNotify).extendRuntime;

    const resultOne = await extendRuntimeEndowment(mockCallback, {
      timeWait: 30,
    });
    const resultTwo = await extendRuntimeEndowment(mockCallback, {
      timeWait: 30,
    });

    expect(callbackExecuted).toBe(true);
    expect(resultOne).toBe(resultTwo);
    expect(mockNotify).toHaveBeenCalledWith({
      method: 'ExecutionTimerRequest',
      params: {
        timeWait: 30,
        timerAction: TimerAction.Pause,
      },
    });
    expect(mockNotify).toHaveBeenCalledWith({
      method: 'ExecutionTimerRequest',
      params: {
        timerAction: TimerAction.Resume,
      },
    });
    expect(mockNotify).toHaveBeenCalledTimes(4);
  });

  it('should throw an error if timeWait is less than specified minimum', async () => {
    const mockNotify = jest.fn();
    let callbackExecuted = false;
    const mockCallback = () => {
      callbackExecuted = true;
    };
    const extendRuntimeEndowment =
      extendRuntime.factory(mockNotify).extendRuntime;
    const timeWait = MIN_RUNTIME_EXTEND - 1;

    await expect(
      extendRuntimeEndowment(mockCallback, { timeWait }),
    ).rejects.toThrow(
      `Extend runtime time can be only between 1 and 3600 seconds. Received: ${timeWait} seconds.`,
    );

    expect(callbackExecuted).toBe(false);
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it('should throw an error if timeWait is greater than specified maximum', async () => {
    const mockNotify = jest.fn();
    let callbackExecuted = false;
    const mockCallback = () => {
      callbackExecuted = true;
    };
    const timeWait = MAX_RUNTIME_EXTEND + 1;
    const extendRuntimeEndowment =
      extendRuntime.factory(mockNotify).extendRuntime;

    await expect(
      extendRuntimeEndowment(mockCallback, { timeWait }),
    ).rejects.toThrow(
      `Extend runtime time can be only between ${MIN_RUNTIME_EXTEND} and ${MAX_RUNTIME_EXTEND} seconds. Received: ${timeWait} seconds.`,
    );

    expect(callbackExecuted).toBe(false);
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it('should throw an error if a callback is not of a proper type', async () => {
    const mockNotify = jest.fn();
    const mockCallback = 'wrong-callback';
    const timeWait = MAX_RUNTIME_EXTEND;
    const extendRuntimeEndowment =
      extendRuntime.factory(mockNotify).extendRuntime;

    await expect(
      // @ts-expect-error It can happen that Snap is passing wrong type for a callback
      extendRuntimeEndowment(mockCallback, { timeWait }),
    ).rejects.toThrow(
      `Extend runtime callback must be a function, but '${typeof mockCallback}' was received instead.`,
    );
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it('should throw an error if a callback failed to execute successfully', async () => {
    const mockNotify = jest.fn();
    const mockCallback = () => {
      throw new Error('Callback failed');
    };
    const timeWait = MAX_RUNTIME_EXTEND;
    const extendRuntimeEndowment =
      extendRuntime.factory(mockNotify).extendRuntime;

    await expect(
      extendRuntimeEndowment(mockCallback, { timeWait }),
    ).rejects.toThrow(`Callback failed`);
    // It is also important to check if timer notifications are sent
    // for both, pause and restart
    expect(mockNotify).toHaveBeenCalledTimes(2);
  });

  it('should throw an error if endowment is used recursively', async () => {
    const mockNotify = jest.fn();
    const timeWait = MAX_RUNTIME_EXTEND;
    const extendRuntimeEndowment =
      extendRuntime.factory(mockNotify).extendRuntime;
    const mockCallback = async () => {
      await extendRuntimeEndowment(mockCallback, { timeWait });
    };

    await expect(
      extendRuntimeEndowment(mockCallback, { timeWait }),
    ).rejects.toThrow(
      `Extend runtime endowment doesn't support multiple calls at the same time or recursive calls.`,
    );
    // It is also important to check if timer notifications are sent
    // for both, pause and restart
    expect(mockNotify).toHaveBeenCalledTimes(2);
  });
});
