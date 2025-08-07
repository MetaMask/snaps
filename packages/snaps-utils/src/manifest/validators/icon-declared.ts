import type { ValidatorMeta } from '../validator-types';

/**
 * Suggest including an icon if not found in manifest.
 */
export const iconDeclared: ValidatorMeta = {
  severity: 'warning',
  semanticCheck(files, context) {
    if (!files.manifest.result.source.location.npm.iconPath) {
      context.report(
        'icon-declared',
        'No icon found in the Snap manifest. It is recommended to include an icon for the Snap. See https://docs.metamask.io/snaps/how-to/design-a-snap/#guidelines-at-a-glance for more information.',
      );
    }
  },
};
