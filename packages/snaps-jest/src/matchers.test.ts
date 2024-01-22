import { expect } from '@jest/globals';
import { panel, text } from '@metamask/snaps-sdk';

import {
  toRender,
  toRespondWith,
  toRespondWithError,
  toSendNotification,
} from './matchers';
import { getMockResponse } from './test-utils';

expect.extend({
  toRespondWith,
  toRespondWithError,
  toSendNotification,
  toRender,
});

describe('toRespondWith', () => {
  it('passes when the response is correct', () => {
    expect(
      getMockResponse({
        response: {
          result: 'foo',
        },
      }),
    ).toRespondWith('foo');
  });

  it('fails when the response is incorrect', () => {
    expect(() =>
      expect(
        getMockResponse({
          response: {
            result: 'foo',
          },
        }),
      ).toRespondWith('bar'),
    ).toThrow('Received:');
  });

  it('fails when the response is an error', () => {
    expect(() =>
      expect(
        getMockResponse({
          response: {
            error: 'foo',
          },
        }),
      ).toRespondWith('foo'),
    ).toThrow('Received error:');
  });

  it('fails when the response is missing', () => {
    expect(() =>
      expect(
        getMockResponse({
          // @ts-expect-error - Invalid response.
          response: null,
        }),
      ).not.toRespondWith('foo'),
    ).toThrow('Received has type:');
  });

  describe('not', () => {
    it('passes when the response is correct', () => {
      expect(
        getMockResponse({
          response: {
            result: 'foo',
          },
        }),
      ).not.toRespondWith('bar');
    });

    it('fails when the response is incorrect', () => {
      expect(() =>
        expect(
          getMockResponse({
            response: {
              result: 'foo',
            },
          }),
        ).not.toRespondWith('foo'),
      ).toThrow('Received:');
    });
  });
});

describe('toRespondWithError', () => {
  it('passes when the response is correct', () => {
    expect(
      getMockResponse({
        response: {
          error: 'foo',
        },
      }),
    ).toRespondWithError('foo');
  });

  it('fails when the response is incorrect', () => {
    expect(() =>
      expect(
        getMockResponse({
          response: {
            error: 'foo',
          },
        }),
      ).toRespondWithError('bar'),
    ).toThrow('Received:');
  });

  it('fails when the response is a result', () => {
    expect(() =>
      expect(
        getMockResponse({
          response: {
            result: 'foo',
          },
        }),
      ).toRespondWithError('foo'),
    ).toThrow('Received result:');
  });

  it('fails when the response is missing', () => {
    expect(() =>
      expect(
        getMockResponse({
          // @ts-expect-error - Invalid response.
          response: null,
        }),
      ).not.toRespondWithError('foo'),
    ).toThrow('Received has type:');
  });

  describe('not', () => {
    it('passes when the response is correct', () => {
      expect(
        getMockResponse({
          response: {
            error: 'foo',
          },
        }),
      ).not.toRespondWithError('bar');
    });

    it('fails when the response is incorrect', () => {
      expect(() =>
        expect(
          getMockResponse({
            response: {
              error: 'foo',
            },
          }),
        ).not.toRespondWithError('foo'),
      ).toThrow('Received:');
    });
  });
});

describe('toSendNotification', () => {
  it('passes when the notification is correct', () => {
    expect(
      getMockResponse({
        notifications: [
          {
            id: '1',
            type: 'native',
            message: 'foo',
          },
        ],
      }),
    ).toSendNotification('foo');
  });

  it('passes when the notification is correct with a type', () => {
    expect(
      getMockResponse({
        notifications: [
          {
            id: '1',
            type: 'native',
            message: 'foo',
          },
        ],
      }),
    ).toSendNotification('foo', 'native');
  });

  it('fails when the notification is incorrect', () => {
    expect(() =>
      expect(
        getMockResponse({
          notifications: [
            {
              id: '1',
              type: 'native',
              message: 'foo',
            },
          ],
        }),
      ).toSendNotification('bar'),
    ).toThrow('Received:');
  });

  it('fails when the notification is incorrect with a type', () => {
    expect(() =>
      expect(
        getMockResponse({
          notifications: [
            {
              id: '1',
              type: 'native',
              message: 'foo',
            },
          ],
        }),
      ).toSendNotification('foo', 'inApp'),
    ).toThrow('Received:');
  });

  describe('not', () => {
    it('passes when the notification is correct', () => {
      expect(
        getMockResponse({
          notifications: [
            {
              id: '1',
              type: 'native',
              message: 'foo',
            },
          ],
        }),
      ).not.toSendNotification('bar');
    });

    it('passes when the notification is correct with a type', () => {
      expect(
        getMockResponse({
          notifications: [
            {
              id: '1',
              type: 'native',
              message: 'foo',
            },
          ],
        }),
      ).not.toSendNotification('foo', 'inApp');
    });

    it('fails when the notification is incorrect', () => {
      expect(() =>
        expect(
          getMockResponse({
            notifications: [
              {
                id: '1',
                type: 'native',
                message: 'foo',
              },
            ],
          }),
        ).not.toSendNotification('foo'),
      ).toThrow('Received:');
    });

    it('fails when the notification is incorrect with a type', () => {
      expect(() =>
        expect(
          getMockResponse({
            notifications: [
              {
                id: '1',
                type: 'native',
                message: 'foo',
              },
            ],
          }),
        ).not.toSendNotification('foo', 'native'),
      ).toThrow('Received:');
    });
  });
});

describe('toRender', () => {
  it('passes when the component is correct', () => {
    expect(
      getMockResponse({
        content: panel([text('Hello, world!')]),
      }),
    ).toRender(panel([text('Hello, world!')]));
  });

  it('fails when the component is incorrect', () => {
    expect(() =>
      expect(
        getMockResponse({
          content: panel([text('Hello, world!')]),
        }),
      ).toRender(panel([text('Hello, world?')])),
    ).toThrow('Received:');
  });

  it('fails when the component is missing', () => {
    expect(() =>
      expect(
        getMockResponse({
          // @ts-expect-error - Invalid response.
          content: null,
        }),
      ).not.toRender(panel([text('Hello, world!')])),
    ).toThrow('Received has type:');
  });

  describe('not', () => {
    it('passes when the component is correct', () => {
      expect(
        getMockResponse({
          content: panel([text('Hello, world!')]),
        }),
      ).not.toRender(panel([text('Hello, world?')]));
    });

    it('fails when the component is incorrect', () => {
      expect(() =>
        expect(
          getMockResponse({
            content: panel([text('Hello, world!')]),
          }),
        ).not.toRender(panel([text('Hello, world!')])),
      ).toThrow('Received:');
    });
  });
});
