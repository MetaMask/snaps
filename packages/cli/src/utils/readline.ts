import readline from 'readline';

let singletonReadlineInterface: readline.Interface;

type PromptArgs = {
  question: string;
  defaultValue?: string;
  shouldClose?: boolean;
  readlineInterface?: readline.Interface;
};

/**
 * Open a readline interface, to prompt for user input. Avoid using this
 * function directly. Use the {@link prompt} function instead.
 */
export function openPrompt(): void {
  singletonReadlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Prompt for user input on the command line. If the prompt isn't open, it will
 * be opened.
 *
 * @param args - The prompt arguments.
 * @param args.question - The question to ask.
 * @param args.defaultValue - The default value to use, if no answer is provided.
 * @param args.shouldClose - Whether to close the readline interface after
 * prompting.
 * @param args.readlineInterface - The readline interface to use. Uses the
 * global readline interface if none provided.
 * @returns The user's input, or the default value if none provided.
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
 * Close the readline interface.
 *
 * @param readlineInterface - The readline interface to close. Uses the global
 * readline interface if none provided.
 * @throws If no readline interface is provided, and the global interface isn't
 * open.
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
