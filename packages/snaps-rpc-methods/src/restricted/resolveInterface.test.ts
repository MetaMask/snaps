import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import {
  resolveInterfaceBuilder,
  getResolveInterfaceImplementation,
} from './resolveInterface';

describe('resolveInterfaceBuilder', () => {
  it('has the expected shape', () => {
    expect(resolveInterfaceBuilder).toStrictEqual({
      targetName: 'snap_resolveInterface',
      specificationBuilder: expect.any(Function),
      methodHooks: {
        resolveInterface: true,
      },
    });
  });

  it('returns the expected specification', () => {
    const methodHooks = {
      resolveInterface: jest.fn(),
    };

    expect(
      resolveInterfaceBuilder.specificationBuilder({ methodHooks }),
    ).toStrictEqual({
      permissionType: PermissionType.RestrictedMethod,
      targetName: 'snap_resolveInterface',
      allowedCaveats: null,
      methodImplementation: expect.any(Function),
      subjectTypes: [SubjectType.Snap],
    });
  });
});

describe('getResolveInterfaceImplementation', () => {
  it('returns the expected result', async () => {
    const resolveInterface = jest.fn().mockResolvedValue(null);

    const methodHooks = {
      resolveInterface,
    };

    const implementation = getResolveInterfaceImplementation(methodHooks);

    const result = await implementation({
      method: 'snap_resolveInterface',
      params: {
        id: 'foo',
        value: true,
      },
      context: {
        origin: MOCK_SNAP_ID,
      },
    });

    expect(result).toBeNull();
  });

  it('throws on invalid params', async () => {
    const resolveInterface = jest.fn().mockResolvedValue(null);

    const methodHooks = {
      resolveInterface,
    };

    const implementation = getResolveInterfaceImplementation(methodHooks);

    await expect(
      implementation({
        method: 'snap_resolveInterface',
        params: {
          // @ts-expect-error invalid params
          id: 3,
        },
        context: {
          origin: MOCK_SNAP_ID,
        },
      }),
    ).rejects.toThrow(
      rpcErrors.invalidParams({
        message: `Invalid params: At path: id -- Expected a string, but received: 3.`,
      }),
    );
  });
});
