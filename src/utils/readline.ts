import readline from 'readline';

let singletonReadlineInterface: readline.Interface;

interface PromptArgs {
  question: string;
  defaultValue?: string;
  shouldClose?: boolean;
  readlineInterface?: readline.Interface;
}

export function openPrompt(): void {
  singletonReadlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

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

export function closePrompt(
  readlineInterface = singletonReadlineInterface,
): void {
  if (readlineInterface) {
    readlineInterface.close();
  }
}
