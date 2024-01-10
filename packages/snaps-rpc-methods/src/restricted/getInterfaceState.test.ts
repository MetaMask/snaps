import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import {
  getInterfaceStateBuilder,
  getGetInterfaceStateImplementation,
} from './getInterfaceState';

describe('getInterfaceStateBuilder', () => {
  it('has the expected shape', () => {
    expect(getInterfaceStateBuilder).toStrictEqual({
      targetName: 'snap_getInterfaceState',
      specificationBuilder: expect.any(Function),
      methodHooks: {
        getInterfaceState: true,
      },
    });
  });

  it('returns the expected specification', () => {
    const methodHooks = {
      getInterfaceState: jest.fn(),
    };

    expect(
      getInterfaceStateBuilder.specificationBuilder({ methodHooks }),
    ).toStrictEqual({
      permissionType: PermissionType.RestrictedMethod,
      targetName: 'snap_getInterfaceState',
      allowedCaveats: null,
      methodImplementation: expect.any(Function),
      subjectTypes: [SubjectType.Snap],
    });
  });
});

describe('getGetInterfaceStateImplementation', () => {
  it('returns the expected result', () => {
    const getInterfaceState = jest.fn().mockReturnValue({ bar: 'foo' });

    const methodHooks = {
      getInterfaceState,
    };

    const implementation = getGetInterfaceStateImplementation(methodHooks);

    const result = implementation({
      method: 'snap_getInterfaceState',
      params: {
        id: 'foo',
      },
      context: {
        origin: MOCK_SNAP_ID,
      },
    });

    expect(result).toStrictEqual({ bar: 'foo' });
  });

  it('throws on invalid params', () => {
    const getInterfaceState = jest.fn().mockResolvedValue('foo');

    const methodHooks = {
      getInterfaceState,
    };

    const implementation = getGetInterfaceStateImplementation(methodHooks);

    expect(() =>
      implementation({
        method: 'snap_getInterfaceState',
        params: {
          // @ts-expect-error invalid params
          id: 3,
        },
        context: {
          origin: MOCK_SNAP_ID,
        },
      }),
    ).toThrow(
      rpcErrors.invalidParams({
        message:
          'Invalid params: At path: id -- Expected a string, but received: 3.',
      }),
    );
  });
});
