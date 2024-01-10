import { text } from '@metamask/snaps-sdk';

import {
  isOnHomePageResponseWithContent,
  isOnHomePageResponseWithId,
} from './home-page';

describe('isOnHomePageResponseWithId', () => {
  it('returns true if the result has an interface id', () => {
    expect(isOnHomePageResponseWithId({ id: 'foo' })).toBe(true);
  });

  it('returns false if the result has no interface id', () => {
    expect(isOnHomePageResponseWithId({ content: text('test') })).toBe(false);
  });
});

describe('isOnHomePageResponseWithContent', () => {
  it('returns true if the result has content', () => {
    expect(isOnHomePageResponseWithContent({ content: text('test') })).toBe(
      true,
    );
  });

  it('returns false if the result has no content', () => {
    expect(isOnHomePageResponseWithContent({ id: 'foo' })).toBe(false);
  });
});
