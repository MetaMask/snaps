import { isConstructor } from '@metamask/snaps-utils';

describe('isConstructor', () => {
  it("will return false if passed in a function who's prototype doesn't have a constructor", () => {
    const mockFn = jest.fn();
    mockFn.prototype = null;
    expect(isConstructor(mockFn)).toBe(false);
  });
});
