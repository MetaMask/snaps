import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import {
  readInterfaceBuilder,
  getReadInterfaceImplementation,
} from './readInterface';

describe('readInterfaceBuilder', () => {
  it('has the expected shape', () => {
    expect(readInterfaceBuilder).toStrictEqual({
      targetName: 'snap_readInterface',
      specificationBuilder: expect.any(Function),
      methodHooks: {
        readInterface: true,
      },
    });
  });

  it('returns the expected specification', () => {
    const methodHooks = {
      readInterface: jest.fn(),
    };

    expect(
      readInterfaceBuilder.specificationBuilder({ methodHooks }),
    ).toStrictEqual({
      permissionType: PermissionType.RestrictedMethod,
      targetName: 'snap_readInterface',
      allowedCaveats: null,
      methodImplementation: expect.any(Function),
      subjectTypes: [SubjectType.Snap],
    });
  });
});

describe('getReadInterfaceImplementation', () => {
  it('returns the expected result', async () => {
    const readInterface = jest.fn().mockResolvedValue(true);

    const methodHooks = {
      readInterface,
    };

    const implementation = getReadInterfaceImplementation(methodHooks);

    const result = await implementation({
      method: 'snap_readInterface',
      params: {
        id: 'foo',
      },
      context: {
        origin: MOCK_SNAP_ID,
      },
    });

    expect(result).toBe(true);
  });

  it('throws on invalid params', async () => {
    const readInterface = jest.fn().mockResolvedValue(true);

    const methodHooks = {
      readInterface,
    };

    const implementation = getReadInterfaceImplementation(methodHooks);

    await expect(
      implementation({
        method: 'snap_readInterface',
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
