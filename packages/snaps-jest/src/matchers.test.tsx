import { expect } from '@jest/globals';
import { NotificationType, panel, text } from '@metamask/snaps-sdk';
import { Box, Text } from '@metamask/snaps-sdk/jsx';
import { getInterfaceActions } from '@metamask/snaps-simulation';
import type {
  RootControllerMessenger,
  SimulationOptions,
} from '@metamask/snaps-simulation';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import {
  toRender,
  toRespondWith,
  toRespondWithError,
  toSendNotification,
} from './matchers';
import {
  getMockInterfaceResponse,
  getMockResponse,
  getRootControllerMessenger,
} from './test-utils';

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
  it('passes when a notification is correct', () => {
    expect(
      getMockResponse({
        notifications: [
          {
            id: '1',
            type: NotificationType.Native,
            message: 'foo',
          },
        ],
      }),
    ).toSendNotification('foo', 'native');
  });

  it('passes when an expanded view notification is correct', () => {
    const controllerMessenger = getRootControllerMessenger();
    const actions = getInterfaceActions(
      MOCK_SNAP_ID,
      controllerMessenger as unknown as RootControllerMessenger,
      {} as SimulationOptions,
      {
        content: (
          <Box>
            <Text>Foo</Text>
          </Box>
        ),
        id: 'abcd',
      },
    );
    expect(
      getMockResponse({
        notifications: [
          {
            id: '1',
            type: NotificationType.InApp,
            message: 'foo',
            title: 'bar',
            content: 'abcd',
            footerLink: { text: 'foo', href: 'https://metamask.io' },
          },
        ],
        getInterface: () => {
          return {
            content: (
              <Box>
                <Text>Foo</Text>
              </Box>
            ),
            ...actions,
          };
        },
      }),
    ).toSendNotification(
      'foo',
      'inApp',
      'bar',
      <Box>
        <Text>Foo</Text>
      </Box>,
      {
        text: 'foo',
        href: 'https://metamask.io',
      },
    );
  });

  it('passes when an expanded view notification without footer is correct', () => {
    const controllerMessenger = getRootControllerMessenger();
    const actions = getInterfaceActions(
      MOCK_SNAP_ID,
      controllerMessenger as unknown as RootControllerMessenger,
      {} as SimulationOptions,
      {
        content: (
          <Box>
            <Text>Foo</Text>
          </Box>
        ),
        id: 'abcd',
      },
    );
    expect(
      getMockResponse({
        notifications: [
          {
            id: '1',
            type: NotificationType.InApp,
            message: 'foo',
            title: 'bar',
            content: 'abcd',
          },
        ],
        getInterface: () => {
          return {
            content: (
              <Box>
                <Text>Foo</Text>
              </Box>
            ),
            ...actions,
          };
        },
      }),
    ).toSendNotification(
      'foo',
      'inApp',
      'bar',
      <Box>
        <Text>Foo</Text>
      </Box>,
    );
  });

  it('passes when the notification is correct with a type', () => {
    expect(
      getMockResponse({
        notifications: [
          {
            id: '1',
            type: NotificationType.Native,
            message: 'foo',
          },
        ],
      }),
    ).toSendNotification('foo', 'native');
  });

  it('fails when a notification message is incorrect', () => {
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
      ).toSendNotification('bar', 'native'),
    ).toThrow('Received');
  });

  it('fails when a notification type is incorrect', () => {
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
    ).toThrow('Received');
  });

  it("fails when an expanded view notification's title is incorrect", () => {
    const controllerMessenger = getRootControllerMessenger();
    const actions = getInterfaceActions(
      MOCK_SNAP_ID,
      controllerMessenger as unknown as RootControllerMessenger,
      {} as SimulationOptions,
      {
        content: (
          <Box>
            <Text>Foo</Text>
          </Box>
        ),
        id: 'abcd',
      },
    );
    expect(() =>
      expect(
        getMockResponse({
          notifications: [
            {
              id: '1',
              type: 'inApp',
              message: 'foo',
              title: 'bar',
              content: 'abcd',
            },
          ],
          getInterface: () => {
            return {
              content: (
                <Box>
                  <Text>Foo</Text>
                </Box>
              ),
              ...actions,
            };
          },
        }),
      ).toSendNotification(
        'foo',
        'inApp',
        'baz',
        <Box>
          <Text>Foo</Text>
        </Box>,
      ),
    ).toThrow('Received');
  });

  it("fails when an expanded view notification's footerLink is incorrect", () => {
    const controllerMessenger = getRootControllerMessenger();
    const actions = getInterfaceActions(
      MOCK_SNAP_ID,
      controllerMessenger as unknown as RootControllerMessenger,
      {} as SimulationOptions,
      {
        content: (
          <Box>
            <Text>Foo</Text>
          </Box>
        ),
        id: 'abcd',
      },
    );
    expect(() =>
      expect(
        getMockResponse({
          notifications: [
            {
              id: '1',
              type: 'inApp',
              message: 'foo',
              title: 'bar',
              content: 'abcd',
              footerLink: { text: 'Leave site', href: 'https://metamask.io' },
            },
          ],
          getInterface: () => {
            return {
              content: (
                <Box>
                  <Text>Foo</Text>
                </Box>
              ),
              ...actions,
            };
          },
        }),
      ).toSendNotification(
        'foo',
        'inApp',
        'bar',
        <Box>
          <Text>Foo</Text>
        </Box>,
        {
          text: 'Go back',
          href: 'metamask://client/',
        },
      ),
    ).toThrow('Received');
  });

  it("fails when an expanded view notification's content is missing", () => {
    const controllerMessenger = getRootControllerMessenger();
    const actions = getInterfaceActions(
      MOCK_SNAP_ID,
      controllerMessenger as unknown as RootControllerMessenger,
      {} as SimulationOptions,
      {
        content: (
          <Box>
            <Text>Foo</Text>
          </Box>
        ),
        id: 'abcd',
      },
    );
    expect(() =>
      expect(
        getMockResponse({
          notifications: [
            {
              id: '1',
              type: 'inApp',
              message: 'foo',
              title: 'bar',
              content: 'abcd',
              footerLink: { text: 'Leave site', href: 'https://metamask.io' },
            },
          ],
          getInterface: () => {
            return {
              content: (
                <Box>
                  <Text>Foo</Text>
                </Box>
              ),
              ...actions,
            };
          },
        }),
      ).toSendNotification('foo', 'inApp', 'bar', undefined, {
        text: 'Leave site',
        href: 'https://metamask.io',
      }),
    ).toThrow('Received');
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
      ).not.toSendNotification('bar', 'native');
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
        ).not.toSendNotification('foo', 'native'),
      ).toThrow('Received');
    });
  });
});

describe('toRender', () => {
  it('passes when the component is correct', () => {
    expect(
      getMockInterfaceResponse(
        <Box>
          <Text>Hello, world!</Text>
        </Box>,
      ),
    ).toRender(panel([text('Hello, world!')]));
  });

  it('passes when the JSX component is correct', () => {
    expect(getMockInterfaceResponse(<Text>foo</Text>)).toRender(
      <Text>foo</Text>,
    );
  });

  it('fails when the component is incorrect', () => {
    expect(() =>
      expect(
        getMockInterfaceResponse(
          <Box>
            <Text>Hello, world!</Text>
          </Box>,
        ),
      ).toRender(panel([text('Hello, world?')])),
    ).toThrow('Received:');
  });

  it('fails when the JSX component is incorrect', () => {
    expect(() =>
      expect(getMockInterfaceResponse(<Text>foo</Text>)).toRender(
        <Text>bar</Text>,
      ),
    ).toThrow('Received:');
  });

  it('fails when the component is missing', () => {
    expect(() =>
      expect(
        getMockInterfaceResponse(
          // @ts-expect-error - Invalid response.
          null,
        ),
      ).not.toRender(panel([text('Hello, world!')])),
    ).toThrow('Received has type:');
  });

  describe('not', () => {
    it('passes when the component is correct', () => {
      expect(
        getMockInterfaceResponse(
          <Box>
            <Text>Hello, world!</Text>
          </Box>,
        ),
      ).not.toRender(panel([text('Hello, world?')]));
    });

    it('passes when the JSX component is correct', () => {
      expect(getMockInterfaceResponse(<Text>foo</Text>)).not.toRender(
        <Text>bar</Text>,
      );
    });

    it('fails when the component is incorrect', () => {
      expect(() =>
        expect(
          getMockInterfaceResponse(
            <Box>
              <Text>Hello, world!</Text>
            </Box>,
          ),
        ).not.toRender(panel([text('Hello, world!')])),
      ).toThrow('Received:');
    });

    it('fails when the JSX component is incorrect', () => {
      expect(() =>
        expect(getMockInterfaceResponse(<Text>foo</Text>)).not.toRender(
          <Text>foo</Text>,
        ),
      ).toThrow('Received:');
    });
  });
});
