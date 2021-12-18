import { endowmentPermissionBuilders } from '.';

describe('index file', () => {
  describe('endowmentPermissionBuilders', () => {
    // For coverage purposes
    it('returns the expected permission specifications', () => {
      expect(
        endowmentPermissionBuilders[
          'endowment:network-access'
        ].specificationBuilder({}),
      ).toMatchObject({
        targetKey: 'endowment:network-access',
      });
    });
  });
});
