import { getPermissionMiddlewareFactory } from './permission-middleware';

describe('permission middleware', () => {
  describe('getPermissionMiddlewareFactory', () => {
    it('returns a permission middleware function', () => {
      expect(
        typeof getPermissionMiddlewareFactory({
          executeRestrictedMethod: jest.fn(),
          getRestrictedMethod: jest.fn(),
          isUnrestrictedMethod: jest.fn(),
        }),
      ).toStrictEqual('function');
    });
  });
});
