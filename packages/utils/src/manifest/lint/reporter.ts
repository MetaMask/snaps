import chalk from 'chalk';
import { VFile } from 'vfile';

// TODO(ritave): Consolidate with SIPs/tools/validate reporter
const reporter = (files: VFile[]) => {
  let output = '';
  for (const file of files) {
    for (const message of file.messages) {
      output +=
        chalk.bold(
          (message.fatal === null ? chalk.blue('info') : chalk.red('error')) +
            `: ${message.reason} ` +
            chalk.gray(`(${message.source}:${message.ruleId})`),
        ) + '\n';
      output += `  ➜ ${file.path}`;
      if (message.line !== null) {
        output += `:${message.line}`;
        if (message.column !== null) {
          output += `:${message.column}`;
        }
      }
      let at: any = message;
      do {
        if (at.stack) {
          output += chalk.gray('\n' + at.stack + '\n---');
        }
        at = at.cause;
      } while (at && at.cause !== undefined);
      output += '\n\n';
    }
  }
  return output.slice(undefined, -2); // remove last '\n\n'
};

export default reporter;
