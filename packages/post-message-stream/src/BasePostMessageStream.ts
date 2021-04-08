import { Duplex } from 'readable-stream';

function noop(): void {
  return undefined;
}

const SYN = 'SYN';
const ACK = 'ACK';

export type StreamData = string | Record<string, unknown>;

export interface PostMessageEvent {
  data?: StreamData;
  origin: string;
  source: typeof window;
}

/**
 * Incomplete base implementation for postMessage streams.
 */
export abstract class BasePostMessageStream extends Duplex {
  private _init: boolean;

  private _haveSyn: boolean;

  constructor() {
    super({
      objectMode: true,
    });

    // initialization flags
    this._init = false;
    this._haveSyn = false;
  }

  // private

  /**
   * Must be called at end of child constructor to initiate
   * communication with other end.
   */
  protected _handshake(): void {
    // send synchronization message
    this._write(SYN, null, noop);
    this.cork();
  }

  protected _onData(data: StreamData): void {
    if (this._init) {
      // forward message
      try {
        this.push(data);
      } catch (err) {
        this.emit('error', err);
      }
    } else if (data === SYN) {
      // listen for handshake
      this._haveSyn = true;
      this._write(ACK, null, noop);
    } else if (data === ACK) {
      this._init = true;
      if (!this._haveSyn) {
        this._write(ACK, null, noop);
      }
      this.uncork();
    }
  }

  /**
   * Child classes must implement this function.
   */
  protected abstract _postMessage(_data?: unknown): void;

  // stream plumbing

  _read(): void {
    return undefined;
  }

  _write(data: StreamData, _encoding: string | null, cb: () => void): void {
    this._postMessage(data);
    cb();
  }
}
