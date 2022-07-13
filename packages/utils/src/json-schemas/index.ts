import { NpmSnapFileNames } from '../file-names';
import validateNpmSnapPackageJson from './validateNpmSnapPackageJson.js';
import validateSnapManifest from './validateSnapManifest.js';

export { NpmSnapPackageJson } from './NpmSnapPackageJson';
export { SnapManifest } from './SnapManifest';

/**
 * Validates a Snap JSON file. Throws a human-readable list of errors if
 * validation fails.
 *
 * @param fileName - The name of Snap JSON file to validate.
 * @param content - The contents of the file.
 */
export function validateSnapJsonFile(
  fileName: NpmSnapFileNames,
  content: unknown,
): void {
  let errors;
  switch (fileName) {
    case NpmSnapFileNames.Manifest:
      if (content && typeof content === 'object' && !Array.isArray(content)) {
        if ((content as any).repository === undefined) {
          // We do this to allow consumers to omit this field. We cannot omit
          // it internally due to TS@<4.4 limitations.
          (content as any).repository = null;
        }
      }

      errors = validateSnapManifest(content);
      break;
    case NpmSnapFileNames.PackageJson:
      errors = validateNpmSnapPackageJson(content);
      break;
    default:
      throw new Error(`Unrecognized file name "${fileName}".`);
  }

  if (errors && errors.length !== 0) {
    throw new Error(
      `${errors
        .reduce(
          (
            allErrors,
            errorObject: { instancePath?: string; message?: string } = {},
          ) => {
            const { instancePath, message = 'unknown error' } = errorObject;
            const currentString = instancePath
              ? `\t${instancePath}\n\t${message}\n\n`
              : `\t${message}\n\n`;

            return `${allErrors}${currentString}`;
          },
          '',
        )
        .replace(/\n$/u, '')}`,
    );
  }
}
