import readline from 'readline';

let rl: readline.Interface;

function openPrompt(): void {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

export function prompt(question: string, def?: string, shouldClose?: boolean): Promise<string> {
  if (!rl) {
    openPrompt();
  }
  return new Promise((resolve, _reject) => {
    let queryString = `${question} `;
    if (def) {
      queryString += `(${def}) `;
    }
    rl.question(queryString, (answer: string) => {
      if (!answer || !answer.trim()) {
        if (def !== undefined) {
          resolve(def);
        }
      }
      resolve(answer.trim());
      if (shouldClose) {
        rl.close();
      }
    });
  });
}

export function closePrompt(): void {
  if (rl) {
    rl.close();
  }
}
