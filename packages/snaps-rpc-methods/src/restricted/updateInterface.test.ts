import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import { text } from '@metamask/snaps-sdk';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import {
  updateInterfaceBuilder,
  getUpdateInterfaceImplementation,
} from './updateInterface';

describe('updateInterfaceBuilder', () => {
  it('has the expected shape', () => {
    expect(updateInterfaceBuilder).toStrictEqual({
      targetName: 'snap_updateInterface',
      specificationBuilder: expect.any(Function),
      methodHooks: {
        updateInterface: true,
      },
    });
  });

  it('returns the expected specification', () => {
    const methodHooks = {
      updateInterface: jest.fn(),
    };

    expect(
      updateInterfaceBuilder.specificationBuilder({ methodHooks }),
    ).toStrictEqual({
      permissionType: PermissionType.RestrictedMethod,
      targetName: 'snap_updateInterface',
      allowedCaveats: null,
      methodImplementation: expect.any(Function),
      subjectTypes: [SubjectType.Snap],
    });
  });
});

describe('getUpdateInterfaceImplementation', () => {
  it('returns the expected result', async () => {
    const updateInterface = jest.fn().mockReturnValue('foo');

    const methodHooks = {
      updateInterface,
    };

    const implementation = getUpdateInterfaceImplementation(methodHooks);

    const result = implementation({
      method: 'snap_updateInterface',
      params: {
        id: 'foo',
        ui: text('foo'),
      },
      context: {
        origin: MOCK_SNAP_ID,
      },
    });

    expect(result).toBeNull();
  });

  it('throws on invalid params', async () => {
    const updateInterface = jest.fn().mockReturnValue('foo');

    const methodHooks = {
      updateInterface,
    };

    const implementation = getUpdateInterfaceImplementation(methodHooks);

    expect(() =>
      implementation({
        method: 'snap_updateInterface',
        params: {
          id: 'foo',
          // @ts-expect-error invalid params
          ui: 'foo',
        },
        context: {
          origin: MOCK_SNAP_ID,
        },
      }),
    ).toThrow(
      rpcErrors.invalidParams({
        message:
          'Invalid params: At path: ui -- Expected the value to satisfy a union of `object | object | object | object | object | object | object | object | object | object | object | object`, but received: "foo".',
      }),
    );
  });
});
