import { Timer } from './Timer';

describe('Timer', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  it('can pause and resume a timeout', () => {
    const timer = new Timer(1000);
    const callback = jest.fn();
    timer.start(callback);

    jest.advanceTimersByTime(500);
    expect(callback).not.toHaveBeenCalled();
    timer.pause();
    jest.advanceTimersByTime(500);
    expect(callback).not.toHaveBeenCalled();
    timer.resume();
    expect(callback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalled();
  });

  it('calls the callback', () => {
    const timer = new Timer(1000);
    const callback = jest.fn(() => {
      expect(timer.status).toStrictEqual('finished');
    });
    timer.start(callback);
    jest.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalled();
    expect(timer.status).toStrictEqual('finished');
  });

  it('can cancel', () => {
    const timer = new Timer(1000);
    const callback = jest.fn();
    timer.start(callback);
    timer.cancel();
    jest.advanceTimersByTime(1000);
    expect(callback).not.toHaveBeenCalled();
  });

  it('works with +Infinity', () => {
    const timer = new Timer(Infinity);
    expect(timer.status).toStrictEqual('stopped');

    const callback = jest.fn();

    timer.start(callback);
    expect(timer.status).toStrictEqual('running');

    jest.advanceTimersByTime(Number.MAX_SAFE_INTEGER);
    expect(timer.status).toStrictEqual('running');

    timer.pause();
    expect(timer.status).toStrictEqual('paused');

    timer.cancel();
    expect(timer.status).toStrictEqual('finished');

    expect(callback).not.toHaveBeenCalled();
  });

  it('throws when trying to resume when not paused', () => {
    const MSG = 'Tried to resume';
    const timer = new Timer(1000);

    expect(() => timer.resume()).toThrow(MSG);
    expect(timer.status).toStrictEqual('stopped');

    timer.start(jest.fn());
    expect(() => timer.resume()).toThrow(MSG);
    expect(timer.status).toStrictEqual('running');

    timer.cancel();
    expect(() => timer.resume()).toThrow(MSG);
    expect(timer.status).toStrictEqual('finished');
  });

  it('throws when trying to start when was already started', () => {
    const MSG = 'Tried to start';
    const timer = new Timer(1000);
    timer.start(jest.fn());

    expect(() => timer.start(jest.fn())).toThrow(MSG);
    expect(timer.status).toStrictEqual('running');

    timer.pause();
    expect(() => timer.start(jest.fn())).toThrow(MSG);
    expect(timer.status).toStrictEqual('paused');

    timer.cancel();
    expect(() => timer.start(jest.fn())).toThrow(MSG);
    expect(timer.status).toStrictEqual('finished');
  });

  it('throws when trying to pause when not running', () => {
    const MSG = 'Tried to pause';
    const timer = new Timer(1000);

    expect(() => timer.pause()).toThrow(MSG);
    expect(timer.status).toStrictEqual('stopped');

    timer.start(jest.fn());
    timer.pause();
    expect(() => timer.pause()).toThrow(MSG);
    expect(timer.status).toStrictEqual('paused');

    timer.cancel();
    expect(() => timer.pause()).toThrow(MSG);
    expect(timer.status).toStrictEqual('finished');
  });

  it('throws when trying to cancel when not running', () => {
    const MSG = 'Tried to cancel';
    const timer = new Timer(1000);

    expect(() => timer.cancel()).toThrow(MSG);
    expect(timer.status).toStrictEqual('stopped');

    timer.start(jest.fn());

    timer.cancel();
    expect(() => timer.cancel()).toThrow(MSG);
    expect(timer.status).toStrictEqual('finished');
  });

  it('reports status', () => {
    const timer = new Timer(1000);
    const callback = jest.fn();

    expect(timer.status).toStrictEqual('stopped');

    timer.start(callback);
    expect(timer.status).toStrictEqual('running');

    timer.pause();
    expect(timer.status).toStrictEqual('paused');

    timer.resume();
    expect(timer.status).toStrictEqual('running');

    jest.advanceTimersByTime(1000);
    expect(timer.status).toStrictEqual('finished');

    expect(callback).toHaveBeenCalled();
  });

  it('throws when negative number given', () => {
    const ERROR = new TypeError("Can't start a timer with negative time");
    expect(() => new Timer(-1000)).toThrow(ERROR);
    expect(() => new Timer(-Infinity)).toThrow(ERROR);
  });

  it('throws when NaN given', () => {
    const ERROR = new TypeError("Can't start a timer with NaN time");
    // You can't create NaNs with bit operations in JavaScript to mangle NaN bits
    // which would check different kinds of NaNs
    // we have to rely on the NaN object
    expect(() => new Timer(NaN)).toThrow(ERROR);
    expect(() => new Timer(Math.sqrt(-1))).toThrow(ERROR);
  });
});
