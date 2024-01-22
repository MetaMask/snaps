import { ControllerMessenger } from '@metamask/base-controller';
import {
  PermissionController,
  SubjectMetadataController,
} from '@metamask/permission-controller';

import { getMockOptions } from '../../test-utils/options';
import { getControllers } from './controllers';
import type { MiddlewareHooks } from './simulation';

const MOCK_HOOKS: MiddlewareHooks = {
  getMnemonic: jest.fn(),
  getSnapFile: jest.fn(),
};

describe('getControllers', () => {
  it('returns the controllers', () => {
    const { permissionController, subjectMetadataController } = getControllers({
      controllerMessenger: new ControllerMessenger(),
      hooks: MOCK_HOOKS,
      runSaga: jest.fn(),
      options: getMockOptions(),
    });

    expect(permissionController).toBeInstanceOf(PermissionController);
    expect(subjectMetadataController).toBeInstanceOf(SubjectMetadataController);
  });
});
