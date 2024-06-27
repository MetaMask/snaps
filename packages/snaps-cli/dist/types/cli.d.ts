/**
 * Check the Node version. If the Node version is less than the minimum required
 * version, this logs an error and exits the process.
 *
 * @param nodeVersion - The Node version to check.
 */
export declare function checkNodeVersion(nodeVersion?: string): void;
/**
 * The main CLI entry point function. This processes the command line args, and
 * runs the appropriate function.
 *
 * @param argv - The raw command line arguments, i.e., `process.argv`.
 * @param commands - The list of commands to use.
 */
export declare function cli(argv: string[], commands: any): Promise<void>;
