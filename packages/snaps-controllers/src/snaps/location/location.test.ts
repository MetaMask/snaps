import { detectSnapLocation } from './location';

describe('detectSnapLocation', () => {
  it.each(['http:', 'https:'])(
    'disallows http like protocols by default',
    (protocol) => {
      expect(() => detectSnapLocation(`${protocol}//127.0.0.1/`)).toThrow(
        'Fetching snaps from external http/https is disabled.',
      );
    },
  );
});
