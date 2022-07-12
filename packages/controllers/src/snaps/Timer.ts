export class Timer {
  private _timeout?: NodeJS.Timeout | number;

  private _start?: number;

  private _remaining: number;

  private _callback?: () => void;

  constructor(ms: number) {
    this._remaining = ms;
  }

  isStarted() {
    return Boolean(this._timeout && this._start);
  }

  isFinished() {
    return this._remaining <= 0;
  }

  cancel() {
    this._remaining = 0;
    clearTimeout(this._timeout as any);
  }

  pause() {
    if (!this.isStarted()) {
      return;
    }
    clearTimeout(this._timeout as any);
    this._timeout = undefined;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._remaining -= Date.now() - this._start!;
  }

  start(callback: () => void) {
    if (this._callback) {
      throw new Error('Timer is already started');
    }
    this._callback = callback;
    this.resume();
  }

  resume() {
    if (this.isStarted() || this.isFinished()) {
      return;
    }
    this._start = Date.now();
    this._timeout = setTimeout(() => this.onFinish(), this._remaining);
  }

  private onFinish() {
    this._remaining = 0;
    this._callback?.();
  }
}
