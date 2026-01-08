import { mnemonicPhraseToBytes } from '@metamask/key-tree';
import { Messenger } from '@metamask/messenger';
import {
  PermissionController,
  SubjectMetadataController,
} from '@metamask/permission-controller';

import { DEFAULT_SRP } from './constants';
import { getControllers } from './controllers';
import type { RestrictedMiddlewareHooks } from './simulation';
import { getMockOptions } from './test-utils';

describe('getControllers', () => {
  it('returns the controllers', async () => {
    const MOCK_HOOKS: RestrictedMiddlewareHooks = {
      getIsLocked: jest.fn(),
      getMnemonic: jest
        .fn()
        .mockResolvedValue(mnemonicPhraseToBytes(DEFAULT_SRP)),
      getSnapFile: jest.fn(),
      createInterface: jest.fn(),
      updateInterface: jest.fn(),
      getInterfaceState: jest.fn(),
      resolveInterface: jest.fn(),
    };

    const { permissionController, subjectMetadataController } =
      await getControllers({
        controllerMessenger: new Messenger({ namespace: 'Root' }),
        hooks: MOCK_HOOKS,
        runSaga: jest.fn(),
        options: getMockOptions(),
      });

    expect(permissionController).toBeInstanceOf(PermissionController);
    expect(subjectMetadataController).toBeInstanceOf(SubjectMetadataController);
  });
});
