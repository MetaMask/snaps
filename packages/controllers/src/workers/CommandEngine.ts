import { WorkerParentPostMessageStream } from '@mm-snap/post-message-stream';

interface PromiseCallbacks {
  resolve: (value?: any) => void;
  reject: (error: Error) => void;
}

export interface CommandRequest {
  command: string;
  data?: string | Record<string, unknown>;
}

export interface CommandResponse {
  id: number;
  result?: unknown;
  error?: Error;
}

export interface WorkerRequest {
  id: number;
  method: string;
  params?: unknown;
}

export type WorkerMessage = CommandResponse | WorkerRequest;

interface CommandEngineArgs {
  workerId: string;
  commandStream: NodeJS.ReadWriteStream;
}

export class CommandEngine {
  public readonly workerId: string;

  private _currentCommandId: number;

  private _idMap: Map<number, PromiseCallbacks>;

  private _stream: WorkerParentPostMessageStream;

  constructor({
    workerId,
    commandStream,
  }: CommandEngineArgs) {
    this.workerId = workerId;
    this._currentCommandId = -1;
    this._idMap = new Map();
    // Typecast: stream types are a mess
    this._stream = commandStream as any;
    this._stream.on('data', this._onMessage.bind(this));
  }

  async command(message: CommandRequest, timeout?: number): Promise<CommandResponse> {
    if (typeof message !== 'object') {
      throw new Error('Must send object.');
    }
    return this._send(message, timeout);
  }

  private _send(message: CommandRequest, timeout = 10000): Promise<CommandResponse> {
    const id = this._getNextId();
    return new Promise((resolve, reject) => {
      this._idMap.set(id, { resolve, reject });
      this._stream.write({ ...message, id });

      setTimeout(() => {
        const commandMetadata = this._idMap.get(id);
        if (commandMetadata) {
          reject(
            new Error(
              `Worker:${this.workerId} took too long to respond to ${message.command} command with id ${id}.`,
            ),
          );
          this._idMap.delete(id);
        }
      }, timeout);
    });
  }

  private _onMessage(message: Partial<WorkerMessage>): void {
    if (!message || typeof message !== 'object' || Array.isArray(message)) {
      console.error(
        `Received message from "worker:${this.workerId}" that isn't a plain object.`,
        message,
      );
      return;
    }

    if (!('id' in message)) {
      console.error(
        `Received message from "worker:${this.workerId}" with no id.`,
        message,
      );
      return;
    }

    if ('result' in message || 'error' in message) {
      return this._handleResponse(message as CommandResponse);
    } else if ('method' in message) {
      return this._handleRequest(message as WorkerRequest);
    }

    console.error(
      `Received malformed message from "worker:${this.workerId}".`,
      message,
    );
  }

  private _handleResponse(message: CommandResponse): void {
    const { id, result, error } = message;
    const commandMetadata = this._idMap.get(id);

    if (!commandMetadata) {
      console.error(
        `Received command response from "worker:${this.workerId}" with unrecognized command id: ${id}`,
        message,
      );
      return;
    }

    if (!result || !error) {
      console.error(
        `Received message from "worker:${this.workerId}" with id "${id}" with missing result and/or error.`,
        message,
      );
      return;
    }

    // TODO:temp
    console.log('Parent: Command Response', message);

    if (error) {
      commandMetadata.reject(error);
    } else {
      commandMetadata.resolve(result);
    }
    this._idMap.delete(id);
  }

  private _handleRequest(message: WorkerRequest): void {

  }

  private _getNextId(): number {
    this._currentCommandId =
      (this._currentCommandId + 1) % Number.MAX_SAFE_INTEGER;
    return this._currentCommandId;
  }
}
