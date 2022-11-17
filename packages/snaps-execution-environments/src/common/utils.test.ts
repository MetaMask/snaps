import { constructError } from './utils';

describe('Utils', () => {
  describe('constructError', () => {
    it('will return the original error if it is an error', () => {
      const error = constructError(new Error('unhandledrejection'));
      expect(error).toStrictEqual(new Error('unhandledrejection'));
    });

    it('will return undefined if it is not passed an Error or a string', () => {
      const error = constructError(undefined);
      expect(error).toBeUndefined();
    });

    it('will return an Error object with the message of the original error if it was a string', () => {
      const error = constructError('some reason');
      expect(error?.message).toBe('some reason');
    });
  });
});
