import { init } from './cmds';
/**
 * The main CLI entry point function. This processes the command line args, and
 * runs the appropriate function.
 *
 * @param argv - The raw command line arguments, i.e., `process.argv`.
 * @param initCommand - Optional specification for init command.
 */
export declare function cli(argv: string[], initCommand?: typeof init): Promise<void>;
