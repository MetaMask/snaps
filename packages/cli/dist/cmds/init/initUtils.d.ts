export declare const TEMPLATE_GIT_URL = "https://github.com/MetaMask/template-snap-monorepo.git";
export declare const SNAP_LOCATION = "packages/snap/";
/**
 * Checks if the destination folder exists and if it's empty. Otherwise create it.
 *
 * @param directory - The desination folder.
 */
export declare function prepareWorkingDirectory(directory: string): Promise<void>;
/**
 * Clones the template in a directory.
 *
 * @param directory - The directory to clone the template in.
 */
export declare function cloneTemplate(directory: string): Promise<void>;
/**
 * Check if git is installed.
 *
 * @returns True if git is installed, or false otherwise.
 */
export declare function isGitInstalled(): boolean;
/**
 * Check if the actual working dir is a git repository.
 *
 * @param directory - The directory to check.
 * @returns True if it's a git repository otherwise false.
 */
export declare function isInGitRepository(directory: string): boolean;
/**
 * Init a git repository.
 *
 * @param directory - The directory to init.
 */
export declare function gitInit(directory: string): Promise<void>;
/**
 * Install dependencies in a yarn project.
 *
 * @param directory - The directory containing the project.
 */
export declare function yarnInstall(directory: string): Promise<void>;
