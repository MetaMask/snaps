import {
  ChainDisconnectedError,
  DisconnectedError,
  InternalError,
  InvalidInputError,
  InvalidParamsError,
  InvalidRequestError,
  LimitExceededError,
  MethodNotFoundError,
  MethodNotSupportedError,
  ParseError,
  ResourceNotFoundError,
  ResourceUnavailableError,
  TransactionRejected,
  UnauthorizedError,
  UnsupportedMethodError,
  UserRejectedRequestError,
} from './error-wrappers';
import { SnapError } from './errors';

describe('Snap errors', () => {
  describe('InternalError', () => {
    it('creates a SnapError', () => {
      const wrapped = new InternalError('foo');

      expect(wrapped).toBeInstanceOf(Error);
      expect(wrapped).toBeInstanceOf(SnapError);
      expect(wrapped).toBeInstanceOf(InternalError);
      expect(wrapped.message).toBe('foo');
      expect(wrapped.code).toBe(-32603);
      expect(wrapped.data).toBeUndefined();
      expect(wrapped.stack).toBeDefined();
      expect(wrapped.toJSON()).toStrictEqual({
        code: -31002,
        message: 'Snap Error',
        data: {
          cause: {
            code: -32603,
            message: 'foo',
            stack: wrapped.stack,
          },
        },
      });
    });

    it('creates a SnapError with data', () => {
      const wrapped = new InternalError('foo', {
        foo: 'bar',
      });

      expect(wrapped.message).toBe('foo');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });

    it('creates a SnapError without a message', () => {
      const wrapped = new InternalError();

      expect(wrapped.message).toBe('Internal JSON-RPC error.');
    });

    it('creates a SnapError without a message and with data', () => {
      const wrapped = new InternalError({
        foo: 'bar',
      });

      expect(wrapped.message).toBe('Internal JSON-RPC error.');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });
  });

  describe('InvalidInputError', () => {
    it('creates a SnapError', () => {
      const wrapped = new InvalidInputError('foo');

      expect(wrapped).toBeInstanceOf(Error);
      expect(wrapped).toBeInstanceOf(SnapError);
      expect(wrapped).toBeInstanceOf(InvalidInputError);
      expect(wrapped.message).toBe('foo');
      expect(wrapped.code).toBe(-32000);
      expect(wrapped.data).toBeUndefined();
      expect(wrapped.stack).toBeDefined();
      expect(wrapped.toJSON()).toStrictEqual({
        code: -31002,
        message: 'Snap Error',
        data: {
          cause: {
            code: -32000,
            message: 'foo',
            stack: wrapped.stack,
          },
        },
      });
    });

    it('creates a SnapError with data', () => {
      const wrapped = new InvalidInputError('foo', {
        foo: 'bar',
      });

      expect(wrapped.message).toBe('foo');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });

    it('creates a SnapError without a message', () => {
      const wrapped = new InvalidInputError();

      expect(wrapped.message).toBe('Invalid input.');
    });

    it('creates a SnapError without a message and with data', () => {
      const wrapped = new InvalidInputError({
        foo: 'bar',
      });

      expect(wrapped.message).toBe('Invalid input.');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });
  });

  describe('InvalidParamsError', () => {
    it('creates a SnapError', () => {
      const wrapped = new InvalidParamsError('foo');

      expect(wrapped).toBeInstanceOf(Error);
      expect(wrapped).toBeInstanceOf(SnapError);
      expect(wrapped).toBeInstanceOf(InvalidParamsError);
      expect(wrapped.message).toBe('foo');
      expect(wrapped.code).toBe(-32602);
      expect(wrapped.data).toBeUndefined();
      expect(wrapped.stack).toBeDefined();
      expect(wrapped.toJSON()).toStrictEqual({
        code: -31002,
        message: 'Snap Error',
        data: {
          cause: {
            code: -32602,
            message: 'foo',
            stack: wrapped.stack,
          },
        },
      });
    });

    it('creates a SnapError with data', () => {
      const wrapped = new InvalidParamsError('foo', {
        foo: 'bar',
      });

      expect(wrapped.message).toBe('foo');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });

    it('creates a SnapError without a message', () => {
      const wrapped = new InvalidParamsError();

      expect(wrapped.message).toBe('Invalid method parameter(s).');
    });

    it('creates a SnapError without a message and with data', () => {
      const wrapped = new InvalidParamsError({
        foo: 'bar',
      });

      expect(wrapped.message).toBe('Invalid method parameter(s).');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });
  });

  describe('InvalidRequestError', () => {
    it('creates a SnapError', () => {
      const wrapped = new InvalidRequestError('foo');

      expect(wrapped).toBeInstanceOf(Error);
      expect(wrapped).toBeInstanceOf(SnapError);
      expect(wrapped).toBeInstanceOf(InvalidRequestError);
      expect(wrapped.message).toBe('foo');
      expect(wrapped.code).toBe(-32600);
      expect(wrapped.data).toBeUndefined();
      expect(wrapped.stack).toBeDefined();
      expect(wrapped.toJSON()).toStrictEqual({
        code: -31002,
        message: 'Snap Error',
        data: {
          cause: {
            code: -32600,
            message: 'foo',
            stack: wrapped.stack,
          },
        },
      });
    });

    it('creates a SnapError with data', () => {
      const wrapped = new InvalidRequestError('foo', {
        foo: 'bar',
      });

      expect(wrapped.message).toBe('foo');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });

    it('creates a SnapError without a message', () => {
      const wrapped = new InvalidRequestError();

      expect(wrapped.message).toBe(
        'The JSON sent is not a valid Request object.',
      );
    });

    it('creates a SnapError without a message and with data', () => {
      const wrapped = new InvalidRequestError({
        foo: 'bar',
      });

      expect(wrapped.message).toBe(
        'The JSON sent is not a valid Request object.',
      );
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });
  });

  describe('LimitExceededError', () => {
    it('creates a SnapError', () => {
      const wrapped = new LimitExceededError('foo');

      expect(wrapped).toBeInstanceOf(Error);
      expect(wrapped).toBeInstanceOf(SnapError);
      expect(wrapped).toBeInstanceOf(LimitExceededError);
      expect(wrapped.message).toBe('foo');
      expect(wrapped.code).toBe(-32005);
      expect(wrapped.data).toBeUndefined();
      expect(wrapped.stack).toBeDefined();
      expect(wrapped.toJSON()).toStrictEqual({
        code: -31002,
        message: 'Snap Error',
        data: {
          cause: {
            code: -32005,
            message: 'foo',
            stack: wrapped.stack,
          },
        },
      });
    });

    it('creates a SnapError with data', () => {
      const wrapped = new LimitExceededError('foo', {
        foo: 'bar',
      });

      expect(wrapped.message).toBe('foo');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });

    it('creates a SnapError without a message', () => {
      const wrapped = new LimitExceededError();

      expect(wrapped.message).toBe('Request limit exceeded.');
    });

    it('creates a SnapError without a message and with data', () => {
      const wrapped = new LimitExceededError({
        foo: 'bar',
      });

      expect(wrapped.message).toBe('Request limit exceeded.');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });
  });

  describe('MethodNotFoundError', () => {
    it('creates a SnapError', () => {
      const wrapped = new MethodNotFoundError('foo');

      expect(wrapped).toBeInstanceOf(Error);
      expect(wrapped).toBeInstanceOf(SnapError);
      expect(wrapped).toBeInstanceOf(MethodNotFoundError);
      expect(wrapped.message).toBe('foo');
      expect(wrapped.code).toBe(-32601);
      expect(wrapped.data).toBeUndefined();
      expect(wrapped.stack).toBeDefined();
      expect(wrapped.toJSON()).toStrictEqual({
        code: -31002,
        message: 'Snap Error',
        data: {
          cause: {
            code: -32601,
            message: 'foo',
            stack: wrapped.stack,
          },
        },
      });
    });

    it('creates a SnapError with data', () => {
      const wrapped = new MethodNotFoundError('foo', {
        foo: 'bar',
      });

      expect(wrapped.message).toBe('foo');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });

    it('creates a SnapError without a message', () => {
      const wrapped = new MethodNotFoundError();

      expect(wrapped.message).toBe(
        'The method does not exist / is not available.',
      );
    });

    it('creates a SnapError without a message and with data', () => {
      const wrapped = new MethodNotFoundError({
        foo: 'bar',
      });

      expect(wrapped.message).toBe(
        'The method does not exist / is not available.',
      );
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });
  });

  describe('MethodNotSupportedError', () => {
    it('creates a SnapError', () => {
      const wrapped = new MethodNotSupportedError('foo');

      expect(wrapped).toBeInstanceOf(Error);
      expect(wrapped).toBeInstanceOf(SnapError);
      expect(wrapped).toBeInstanceOf(MethodNotSupportedError);
      expect(wrapped.message).toBe('foo');
      expect(wrapped.code).toBe(-32004);
      expect(wrapped.data).toBeUndefined();
      expect(wrapped.stack).toBeDefined();
      expect(wrapped.toJSON()).toStrictEqual({
        code: -31002,
        message: 'Snap Error',
        data: {
          cause: {
            code: -32004,
            message: 'foo',
            stack: wrapped.stack,
          },
        },
      });
    });

    it('creates a SnapError with data', () => {
      const wrapped = new MethodNotSupportedError('foo', {
        foo: 'bar',
      });

      expect(wrapped.message).toBe('foo');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });

    it('creates a SnapError without a message', () => {
      const wrapped = new MethodNotSupportedError();

      expect(wrapped.message).toBe('Method not supported.');
    });

    it('creates a SnapError without a message and with data', () => {
      const wrapped = new MethodNotSupportedError({
        foo: 'bar',
      });

      expect(wrapped.message).toBe('Method not supported.');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });
  });

  describe('ParseError', () => {
    it('creates a SnapError', () => {
      const wrapped = new ParseError('foo');

      expect(wrapped).toBeInstanceOf(Error);
      expect(wrapped).toBeInstanceOf(SnapError);
      expect(wrapped).toBeInstanceOf(ParseError);
      expect(wrapped.message).toBe('foo');
      expect(wrapped.code).toBe(-32700);
      expect(wrapped.data).toBeUndefined();
      expect(wrapped.stack).toBeDefined();
      expect(wrapped.toJSON()).toStrictEqual({
        code: -31002,
        message: 'Snap Error',
        data: {
          cause: {
            code: -32700,
            message: 'foo',
            stack: wrapped.stack,
          },
        },
      });
    });

    it('creates a SnapError with data', () => {
      const wrapped = new ParseError('foo', {
        foo: 'bar',
      });

      expect(wrapped.message).toBe('foo');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });

    it('creates a SnapError without a message', () => {
      const wrapped = new ParseError();

      expect(wrapped.message).toBe(
        'Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.',
      );
    });

    it('creates a SnapError without a message and with data', () => {
      const wrapped = new ParseError({
        foo: 'bar',
      });

      expect(wrapped.message).toBe(
        'Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.',
      );
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });
  });

  describe('ResourceNotFoundError', () => {
    it('creates a SnapError', () => {
      const wrapped = new ResourceNotFoundError('foo');

      expect(wrapped).toBeInstanceOf(Error);
      expect(wrapped).toBeInstanceOf(SnapError);
      expect(wrapped).toBeInstanceOf(ResourceNotFoundError);
      expect(wrapped.message).toBe('foo');
      expect(wrapped.code).toBe(-32001);
      expect(wrapped.data).toBeUndefined();
      expect(wrapped.stack).toBeDefined();
      expect(wrapped.toJSON()).toStrictEqual({
        code: -31002,
        message: 'Snap Error',
        data: {
          cause: {
            code: -32001,
            message: 'foo',
            stack: wrapped.stack,
          },
        },
      });
    });

    it('creates a SnapError with data', () => {
      const wrapped = new ResourceNotFoundError('foo', {
        foo: 'bar',
      });

      expect(wrapped.message).toBe('foo');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });

    it('creates a SnapError without a message', () => {
      const wrapped = new ResourceNotFoundError();

      expect(wrapped.message).toBe('Resource not found.');
    });

    it('creates a SnapError without a message and with data', () => {
      const wrapped = new ResourceNotFoundError({
        foo: 'bar',
      });

      expect(wrapped.message).toBe('Resource not found.');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });
  });

  describe('ResourceUnavailableError', () => {
    it('creates a SnapError', () => {
      const wrapped = new ResourceUnavailableError('foo');

      expect(wrapped).toBeInstanceOf(Error);
      expect(wrapped).toBeInstanceOf(SnapError);
      expect(wrapped).toBeInstanceOf(ResourceUnavailableError);
      expect(wrapped.message).toBe('foo');
      expect(wrapped.code).toBe(-32002);
      expect(wrapped.data).toBeUndefined();
      expect(wrapped.stack).toBeDefined();
      expect(wrapped.toJSON()).toStrictEqual({
        code: -31002,
        message: 'Snap Error',
        data: {
          cause: {
            code: -32002,
            message: 'foo',
            stack: wrapped.stack,
          },
        },
      });
    });

    it('creates a SnapError with data', () => {
      const wrapped = new ResourceUnavailableError('foo', {
        foo: 'bar',
      });

      expect(wrapped.message).toBe('foo');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });

    it('creates a SnapError without a message', () => {
      const wrapped = new ResourceUnavailableError();

      expect(wrapped.message).toBe('Resource unavailable.');
    });

    it('creates a SnapError without a message and with data', () => {
      const wrapped = new ResourceUnavailableError({
        foo: 'bar',
      });

      expect(wrapped.message).toBe('Resource unavailable.');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });
  });

  describe('TransactionRejected', () => {
    it('creates a SnapError', () => {
      const wrapped = new TransactionRejected('foo');

      expect(wrapped).toBeInstanceOf(Error);
      expect(wrapped).toBeInstanceOf(SnapError);
      expect(wrapped).toBeInstanceOf(TransactionRejected);
      expect(wrapped.message).toBe('foo');
      expect(wrapped.code).toBe(-32003);
      expect(wrapped.data).toBeUndefined();
      expect(wrapped.stack).toBeDefined();
      expect(wrapped.toJSON()).toStrictEqual({
        code: -31002,
        message: 'Snap Error',
        data: {
          cause: {
            code: -32003,
            message: 'foo',
            stack: wrapped.stack,
          },
        },
      });
    });

    it('creates a SnapError with data', () => {
      const wrapped = new TransactionRejected('foo', {
        foo: 'bar',
      });

      expect(wrapped.message).toBe('foo');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });

    it('creates a SnapError without a message', () => {
      const wrapped = new TransactionRejected();

      expect(wrapped.message).toBe('Transaction rejected.');
    });

    it('creates a SnapError without a message and with data', () => {
      const wrapped = new TransactionRejected({
        foo: 'bar',
      });

      expect(wrapped.message).toBe('Transaction rejected.');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });
  });

  describe('ChainDisconnectedError', () => {
    it('creates a SnapError', () => {
      const wrapped = new ChainDisconnectedError('foo');

      expect(wrapped).toBeInstanceOf(Error);
      expect(wrapped).toBeInstanceOf(SnapError);
      expect(wrapped).toBeInstanceOf(ChainDisconnectedError);
      expect(wrapped.message).toBe('foo');
      expect(wrapped.code).toBe(4901);
      expect(wrapped.data).toBeUndefined();
      expect(wrapped.stack).toBeDefined();
      expect(wrapped.toJSON()).toStrictEqual({
        code: -31002,
        message: 'Snap Error',
        data: {
          cause: {
            code: 4901,
            message: 'foo',
            stack: wrapped.stack,
          },
        },
      });
    });

    it('creates a SnapError with data', () => {
      const wrapped = new ChainDisconnectedError('foo', {
        foo: 'bar',
      });

      expect(wrapped.message).toBe('foo');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });

    it('creates a SnapError without a message', () => {
      const wrapped = new ChainDisconnectedError();

      expect(wrapped.message).toBe(
        'The provider is disconnected from the specified chain.',
      );
    });

    it('creates a SnapError without a message and with data', () => {
      const wrapped = new ChainDisconnectedError({
        foo: 'bar',
      });

      expect(wrapped.message).toBe(
        'The provider is disconnected from the specified chain.',
      );
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });
  });

  describe('DisconnectedError', () => {
    it('creates a SnapError', () => {
      const wrapped = new DisconnectedError('foo');

      expect(wrapped).toBeInstanceOf(Error);
      expect(wrapped).toBeInstanceOf(SnapError);
      expect(wrapped).toBeInstanceOf(DisconnectedError);
      expect(wrapped.message).toBe('foo');
      expect(wrapped.code).toBe(4900);
      expect(wrapped.data).toBeUndefined();
      expect(wrapped.stack).toBeDefined();
      expect(wrapped.toJSON()).toStrictEqual({
        code: -31002,
        message: 'Snap Error',
        data: {
          cause: {
            code: 4900,
            message: 'foo',
            stack: wrapped.stack,
          },
        },
      });
    });

    it('creates a SnapError with data', () => {
      const wrapped = new DisconnectedError('foo', {
        foo: 'bar',
      });

      expect(wrapped.message).toBe('foo');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });

    it('creates a SnapError without a message', () => {
      const wrapped = new DisconnectedError();

      expect(wrapped.message).toBe(
        'The provider is disconnected from all chains.',
      );
    });

    it('creates a SnapError without a message and with data', () => {
      const wrapped = new DisconnectedError({
        foo: 'bar',
      });

      expect(wrapped.message).toBe(
        'The provider is disconnected from all chains.',
      );
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });
  });

  describe('UnauthorizedError', () => {
    it('creates a SnapError', () => {
      const wrapped = new UnauthorizedError('foo');

      expect(wrapped).toBeInstanceOf(Error);
      expect(wrapped).toBeInstanceOf(SnapError);
      expect(wrapped).toBeInstanceOf(UnauthorizedError);
      expect(wrapped.message).toBe('foo');
      expect(wrapped.code).toBe(4100);
      expect(wrapped.data).toBeUndefined();
      expect(wrapped.stack).toBeDefined();
      expect(wrapped.toJSON()).toStrictEqual({
        code: -31002,
        message: 'Snap Error',
        data: {
          cause: {
            code: 4100,
            message: 'foo',
            stack: wrapped.stack,
          },
        },
      });
    });

    it('creates a SnapError with data', () => {
      const wrapped = new UnauthorizedError('foo', {
        foo: 'bar',
      });

      expect(wrapped.message).toBe('foo');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });

    it('creates a SnapError without a message', () => {
      const wrapped = new UnauthorizedError();

      expect(wrapped.message).toBe(
        'The requested account and/or method has not been authorized by the user.',
      );
    });

    it('creates a SnapError without a message and with data', () => {
      const wrapped = new UnauthorizedError({
        foo: 'bar',
      });

      expect(wrapped.message).toBe(
        'The requested account and/or method has not been authorized by the user.',
      );
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });
  });

  describe('UnsupportedMethodError', () => {
    it('creates a SnapError', () => {
      const wrapped = new UnsupportedMethodError('foo');

      expect(wrapped).toBeInstanceOf(Error);
      expect(wrapped).toBeInstanceOf(SnapError);
      expect(wrapped).toBeInstanceOf(UnsupportedMethodError);
      expect(wrapped.message).toBe('foo');
      expect(wrapped.code).toBe(4200);
      expect(wrapped.data).toBeUndefined();
      expect(wrapped.stack).toBeDefined();
      expect(wrapped.toJSON()).toStrictEqual({
        code: -31002,
        message: 'Snap Error',
        data: {
          cause: {
            code: 4200,
            message: 'foo',
            stack: wrapped.stack,
          },
        },
      });
    });

    it('creates a SnapError with data', () => {
      const wrapped = new UnsupportedMethodError('foo', {
        foo: 'bar',
      });

      expect(wrapped.message).toBe('foo');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });

    it('creates a SnapError without a message', () => {
      const wrapped = new UnsupportedMethodError();

      expect(wrapped.message).toBe(
        'The requested method is not supported by this Ethereum provider.',
      );
    });

    it('creates a SnapError without a message and with data', () => {
      const wrapped = new UnsupportedMethodError({
        foo: 'bar',
      });

      expect(wrapped.message).toBe(
        'The requested method is not supported by this Ethereum provider.',
      );
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });
  });

  describe('UserRejectedRequestError', () => {
    it('creates a SnapError', () => {
      const wrapped = new UserRejectedRequestError('foo');

      expect(wrapped).toBeInstanceOf(Error);
      expect(wrapped).toBeInstanceOf(SnapError);
      expect(wrapped).toBeInstanceOf(UserRejectedRequestError);
      expect(wrapped.message).toBe('foo');
      expect(wrapped.code).toBe(4001);
      expect(wrapped.data).toBeUndefined();
      expect(wrapped.stack).toBeDefined();
      expect(wrapped.toJSON()).toStrictEqual({
        code: -31002,
        message: 'Snap Error',
        data: {
          cause: {
            code: 4001,
            message: 'foo',
            stack: wrapped.stack,
          },
        },
      });
    });

    it('creates a SnapError with data', () => {
      const wrapped = new UserRejectedRequestError('foo', {
        foo: 'bar',
      });

      expect(wrapped.message).toBe('foo');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });

    it('creates a SnapError without a message', () => {
      const wrapped = new UserRejectedRequestError();

      expect(wrapped.message).toBe('User rejected the request.');
    });

    it('creates a SnapError without a message and with data', () => {
      const wrapped = new UserRejectedRequestError({
        foo: 'bar',
      });

      expect(wrapped.message).toBe('User rejected the request.');
      expect(wrapped.data).toStrictEqual({
        foo: 'bar',
      });
    });
  });
});
