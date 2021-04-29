const readline = require('readline');
const { prompt, closePrompt } = require('../../dist/src/utils/readline');

jest.mock('readline', () => {
  return { createInterface: jest.fn() };
});

describe('readline', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('prompt', () => {
    let questionMock;
    const closeMock = jest.fn();

    afterEach(() => {
      questionMock.mockRestore();
      questionMock = null;
    });

    it('should create an interface, open a prompt, read in user input from stdin, and return the trimmed input', async () => {
      questionMock = jest.fn((_, cb) => cb('answer '));
      const createInterfaceSpy = jest
        .spyOn(readline, 'createInterface')
        .mockImplementationOnce(() => {
          return { question: questionMock };
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
        readlineInterface: { question: questionMock },
      });
      expect(promptResult).toStrictEqual('default');
    });

    it('if shouldClose is true, function should call close', async () => {
      questionMock = jest.fn((_, cb) => cb('answer '));
      await prompt({
        question: 'question',
        defaultValue: 'default',
        shouldClose: true,
        readlineInterface: { question: questionMock, close: closeMock },
      });
      expect(closeMock).toHaveBeenCalled();
    });

    it('if shouldClose is false, function should not call close', async () => {
      questionMock = jest.fn((_, cb) => cb('answer '));

      await prompt({
        question: 'question',
        defaultValue: 'default',
        shouldClose: false,
        readlineInterface: { question: questionMock, close: closeMock },
      });
      expect(closeMock).not.toHaveBeenCalled();
    });
  });

  describe('closePrompt', () => {
    it('should close the readline interface', () => {
      const closeMock = jest.fn();

      closePrompt({ close: closeMock });
      expect(closeMock).toHaveBeenCalled();
    });
  });
});
