import type { SnapManifest, VirtualFile } from '@metamask/snaps-utils';
import { SnapManifestStruct, getSnapChecksum } from '@metamask/snaps-utils';

type ValidatorContext = {
  sourceCode: VirtualFile<string>;
  icon: VirtualFile<string>;
};

type ValidatorFunction = (
  value: VirtualFile<SnapManifest>,
  context: ValidatorContext,
) => Promise<boolean | string>;

export type Validator = {
  name: string;
  manifestName: string;
  validator: ValidatorFunction;
};

export const validators: Validator[] = [
  {
    name: 'Title',
    manifestName: 'proposedName',
    validator: async (manifest: VirtualFile<SnapManifest>) => {
      const [error] = SnapManifestStruct.schema.proposedName.validate(
        manifest?.result?.proposedName,
      );
      return error?.message ?? true;
    },
  },
  {
    name: 'Description',
    manifestName: 'description',
    validator: async (manifest: VirtualFile<SnapManifest>) => {
      const [error] = SnapManifestStruct.schema.description.validate(
        manifest?.result?.description,
      );
      return error?.message ?? true;
    },
  },
  {
    name: 'Icon',
    manifestName: 'iconPath',
    validator: async (manifest: VirtualFile<SnapManifest>, { icon }) => {
      const [error] =
        SnapManifestStruct.schema.source.schema.location.schema.npm.schema.iconPath.validate(
          manifest?.result?.source?.location?.npm?.iconPath,
        );

      if (error) {
        return error.message;
      }

      if (!icon) {
        return 'Unable to load icon.';
      }

      return true;
    },
  },
  {
    name: 'Permissions',
    manifestName: 'initialPermissions',
    validator: async (manifest: VirtualFile<SnapManifest>) => {
      const [error] = SnapManifestStruct.schema.initialPermissions.validate(
        manifest?.result?.initialPermissions,
      );
      return error?.message ?? true;
    },
  },
  {
    name: 'Checksum',
    manifestName: 'source.shasum',
    validator: async (
      manifest: VirtualFile<SnapManifest>,
      { sourceCode, icon },
    ) => {
      if (manifest) {
        const manifestShasum = manifest.result?.source.shasum;
        const calculatedShasum = getSnapChecksum({
          manifest,
          sourceCode,
          svgIcon: icon,
        });

        if (manifestShasum !== calculatedShasum) {
          return `Checksum mismatch - expected "${calculatedShasum}" got "${manifestShasum}"`;
        }
      }

      return true;
    },
  },
  {
    name: 'Bundle',
    manifestName: 'filePath',
    validator: async (manifest: VirtualFile<SnapManifest>, { sourceCode }) => {
      const [error] =
        SnapManifestStruct.schema.source.schema.location.schema.npm.schema.filePath.validate(
          manifest?.result?.source?.location?.npm?.filePath,
        );

      if (error) {
        return error.message;
      }

      if (!sourceCode) {
        return 'Unable to load bundle.';
      }

      return true;
    },
  },
];
