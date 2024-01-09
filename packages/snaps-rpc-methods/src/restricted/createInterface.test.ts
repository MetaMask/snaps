import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import { text } from '@metamask/snaps-sdk';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import {
  showInterfaceBuilder,
  getShowInterfaceImplementation,
} from './createInterface';

describe('showInterfaceBuilder', () => {
  it('has the expected shape', () => {
    expect(showInterfaceBuilder).toStrictEqual({
      targetName: 'snap_showInterface',
      specificationBuilder: expect.any(Function),
      methodHooks: {
        showInterface: true,
      },
    });
  });

  it('returns the expected specification', () => {
    const methodHooks = {
      showInterface: jest.fn(),
    };

    expect(
      showInterfaceBuilder.specificationBuilder({ methodHooks }),
    ).toStrictEqual({
      permissionType: PermissionType.RestrictedMethod,
      targetName: 'snap_showInterface',
      allowedCaveats: null,
      methodImplementation: expect.any(Function),
      subjectTypes: [SubjectType.Snap],
    });
  });
});

describe('getShowInterfaceImplementation', () => {
  it('returns the expected result', async () => {
    const showInterface = jest.fn().mockResolvedValue('foo');

    const methodHooks = {
      showInterface,
    };

    const implementation = getShowInterfaceImplementation(methodHooks);

    const result = await implementation({
      method: 'snap_showInterface',
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
    const showInterface = jest.fn().mockResolvedValue('foo');

    const methodHooks = {
      showInterface,
    };

    const implementation = getShowInterfaceImplementation(methodHooks);

    await expect(
      implementation({
        method: 'snap_showInterface',
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
