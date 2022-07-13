import { Timer } from './Timer';

describe('Timer', () => {
  jest.useFakeTimers();
  const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
  const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('can pause and resume a timeout', () => {
    const timer = new Timer(1000);
    const callback = () => undefined;
    timer.start(callback);
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
    expect(timer.isStarted()).toBe(true);
    jest.advanceTimersByTime(500);
    timer.pause();
    expect(clearTimeoutSpy).toHaveBeenCalledWith(expect.any(Number));
    timer.resume();
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 500);
  });

  it('functions as a timeout', () => {
    const timer = new Timer(1000);
    const callback = jest.fn();
    timer.start(callback);
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
    expect(timer.isStarted()).toBe(true);
    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledWith();
    expect(timer.isFinished()).toBe(true);
  });

  it('can cancel a timeout', () => {
    const timer = new Timer(1000);
    const callback = jest.fn();
    timer.start(callback);
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
    timer.cancel();
    expect(clearTimeoutSpy).toHaveBeenCalledWith(expect.any(Number));
    jest.advanceTimersByTime(1000);
    expect(callback).not.toHaveBeenCalled();
  });

  it('doesnt pause if already paused', () => {
    const timer = new Timer(1000);
    const callback = () => undefined;
    timer.start(callback);
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
    timer.pause();
    expect(clearTimeoutSpy).toHaveBeenCalledWith(expect.any(Number));
    timer.pause();
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
  });

  it('doesnt start if already started', () => {
    const timer = new Timer(1000);
    const callback = () => undefined;
    timer.start(callback);
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
    expect(() => timer.start(callback)).toThrow('Timer is already started');
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
  });

  it('doesnt resume if already finished', () => {
    const timer = new Timer(1000);
    const callback = jest.fn();
    timer.start(callback);
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledWith();
    timer.resume();
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
  });
});
