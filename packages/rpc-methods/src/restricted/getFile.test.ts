import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { stringToBytes, bytesToString } from '@metamask/utils';

import { getImplementation, specificationBuilder } from './getFile';

describe('snap_getFile', () => {
  describe('specification', () => {
    it('builds specification', () => {
      const methodHooks = {
        getSnapFile: jest.fn(),
      };

      expect(
        specificationBuilder({
          methodHooks,
        }),
      ).toStrictEqual({
        allowedCaveats: null,
        methodImplementation: expect.anything(),
        permissionType: PermissionType.RestrictedMethod,
        targetName: 'snap_getFile',
        subjectTypes: [SubjectType.Snap],
      });
    });
  });

  describe('getImplementation', () => {
    it('returns a Uint8Array', async () => {
      const methodHooks = {
        getSnapFile: jest.fn().mockResolvedValue(stringToBytes('bar')),
      };

      const implementation = getImplementation(methodHooks);

      expect(
        bytesToString(
          await implementation({
            context: {
              origin: 'npm:@metamask/example-snap',
            },
            method: 'snap_getFile',
            params: {
              path: './dist/foo.json',
            },
          }),
        ),
      ).toBe('bar');
    });
  });
});
