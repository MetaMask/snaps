import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import { text } from '@metamask/snaps-sdk';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import {
  createInterfaceBuilder,
  getCreateInterfaceImplementation,
} from './createInterface';

describe('createInterfaceBuilder', () => {
  it('has the expected shape', () => {
    expect(createInterfaceBuilder).toStrictEqual({
      targetName: 'snap_createInterface',
      specificationBuilder: expect.any(Function),
      methodHooks: {
        createInterface: true,
      },
    });
  });

  it('returns the expected specification', () => {
    const methodHooks = {
      createInterface: jest.fn(),
    };

    expect(
      createInterfaceBuilder.specificationBuilder({ methodHooks }),
    ).toStrictEqual({
      permissionType: PermissionType.RestrictedMethod,
      targetName: 'snap_createInterface',
      allowedCaveats: null,
      methodImplementation: expect.any(Function),
      subjectTypes: [SubjectType.Snap],
    });
  });
});

describe('getCreateInterfaceImplementation', () => {
  it('returns the expected result', async () => {
    const createInterface = jest.fn().mockResolvedValue('foo');

    const methodHooks = {
      createInterface,
    };

    const implementation = getCreateInterfaceImplementation(methodHooks);

    const result = await implementation({
      method: 'snap_createInterface',
      params: {
        ui: text('foo'),
      },
      context: {
        origin: MOCK_SNAP_ID,
      },
    });

    expect(result).toBe('foo');
  });

  it('throws on invalid params', async () => {
    const createInterface = jest.fn().mockResolvedValue('foo');

    const methodHooks = {
      createInterface,
    };

    const implementation = getCreateInterfaceImplementation(methodHooks);

    await expect(
      implementation({
        method: 'snap_createInterface',
        params: {
          // @ts-expect-error invalid params
          ui: 'foo',
        },
        context: {
          origin: MOCK_SNAP_ID,
        },
      }),
    ).rejects.toThrow(
      rpcErrors.invalidParams({
        message:
          'Invalid params: At path: ui -- Expected the value to satisfy a union of `object | object | object | object | object | object | object | object | object | object | object | object`, but received: "foo".',
      }),
    );
  });
});
