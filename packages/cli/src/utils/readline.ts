import readline from 'readline';

let singletonReadlineInterface: readline.Interface;

type PromptArgs = {
  question: string;
  defaultValue?: string;
  shouldClose?: boolean;
  readlineInterface?: readline.Interface;
};

/**
 *
 */
export function openPrompt(): void {
  singletonReadlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * @param options0
 * @param options0.question
 * @param options0.defaultValue
 * @param options0.shouldClose
 * @param options0.readlineInterface
 */
export function prompt({
  question,
  defaultValue,
  shouldClose,
  readlineInterface = singletonReadlineInterface,
}: PromptArgs): Promise<string> {
  let _readlineInterface = readlineInterface;
  if (!_readlineInterface) {
    openPrompt();
    _readlineInterface = singletonReadlineInterface;
  }

  return new Promise((resolve, _reject) => {
    let queryString = `${question} `;
    if (defaultValue) {
      queryString += `(${defaultValue}) `;
    }

    _readlineInterface.question(queryString, (answer: string) => {
      if (!answer || !answer.trim()) {
        if (defaultValue !== undefined) {
          resolve(defaultValue);
        }
      }
      resolve(answer.trim());
      if (shouldClose) {
        _readlineInterface.close();
      }
    });
  });
}

/**
 * @param readlineInterface
 */
export function closePrompt(
  readlineInterface = singletonReadlineInterface,
): void {
  if (readlineInterface) {
    readlineInterface.close();
  } else {
    throw new Error('You are attempting to close a non existent prompt.');
  }
}
