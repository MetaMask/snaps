import { constructError } from './utils';

describe('Utils', () => {
  describe('constructError', () => {
    it('will return the original error if it is an error', () => {
      const err = constructError(new Error('unhandledrejection'));
      expect(err).toStrictEqual(new Error('unhandledrejection'));
    });

    it('will return undefined if it is not passed an Error or a string', () => {
      const err = constructError(undefined);
      expect(err).toBeUndefined();
    });

    it('will return an Error object with the message of the original error if it was a string', () => {
      const err = constructError('some reason');
      expect(err?.message).toStrictEqual('some reason');
    });
  });
});
