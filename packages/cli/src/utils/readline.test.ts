import readline from 'readline';
import { prompt, closePrompt, openPrompt } from '.';

jest.mock('readline', () => {
  return { createInterface: jest.fn() };
});

describe('readline', () => {
  describe('prompt', () => {
    let questionMock: (...args: any[]) => any;
    const closeMock = jest.fn();

    it('should create an interface, open a prompt, read in user input from stdin, and return the trimmed input', async () => {
      questionMock = jest.fn((_, cb) => cb('answer '));
      const createInterfaceSpy = jest
        .spyOn(readline, 'createInterface')
        .mockImplementationOnce(() => {
          return { question: questionMock } as any;
        });

      const promptResult = await prompt({
        question: 'question',
      });
      expect(createInterfaceSpy).toHaveBeenCalledTimes(1);
      expect(promptResult).toStrictEqual('answer');
    });

    it('if the user fails to provide an input, the default should be used', async () => {
      questionMock = jest.fn((_, cb) => cb(''));

      const promptResult = await prompt({
        question: 'question',
        defaultValue: 'default',
        readlineInterface: { question: questionMock } as any,
      });
      expect(promptResult).toStrictEqual('default');
    });

    it('if the user fails to provide an input AND there is no defaultValue, it should resolve to an empty string', async () => {
      questionMock = jest.fn((_, cb) => cb(''));
      const promptResult = await prompt({
        question: 'question',
        readlineInterface: { question: questionMock } as any,
      });
      expect(promptResult).toStrictEqual('');
    });

    it('if shouldClose is true, function should call close', async () => {
      questionMock = jest.fn((_, cb) => cb('answer '));
      await prompt({
        question: 'question',
        defaultValue: 'default',
        shouldClose: true,
        readlineInterface: { question: questionMock, close: closeMock } as any,
      });
      expect(closeMock).toHaveBeenCalled();
    });

    it('if shouldClose is false, function should not call close', async () => {
      questionMock = jest.fn((_, cb) => cb('answer '));

      await prompt({
        question: 'question',
        defaultValue: 'default',
        shouldClose: false,
        readlineInterface: { question: questionMock, close: closeMock } as any,
      });
      expect(closeMock).not.toHaveBeenCalled();
    });
  });

  describe('closePrompt', () => {
    it('should close the provided readline interface', () => {
      const closeMock = jest.fn();
      closePrompt({ close: closeMock } as any);
      expect(closeMock).toHaveBeenCalled();
    });

    it('should throw an error if a readline interface is not provided', async () => {
      openPrompt();
      expect(() => closePrompt()).toThrow(
        'You are attempting to close a non existent prompt.',
      );
    });
  });
});
