/**
 * An error that is thrown when the CLI fails. This is the base error for all
 * CLI errors. It is not thrown directly, but is instead extended by other
 * errors.
 *
 * This error is assumed to have all the information needed to display a
 * readable error message, so it does not include the stack trace when it is
 * thrown.
 */
export declare class CLIError extends Error {
}
/**
 * An error that is thrown when a command fails.
 *
 * It wraps the error prefix in a bold red "Error" string.
 */
export declare class CommandError extends CLIError {
    constructor(message: string, name?: string);
}
/**
 * An error that is thrown when the config file cannot be loaded.
 */
export declare class ConfigError extends CommandError {
    constructor(message: string);
}
