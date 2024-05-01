import { expect } from '@jest/globals';
import { panel, text } from '@metamask/snaps-sdk';
import { Box, Button, Field, Form, Input, Text } from '@metamask/snaps-sdk/jsx';

import {
  serialiseJsx,
  toRender,
  toRespondWith,
  toRespondWithError,
  toSendNotification,
} from './matchers';
import { getMockInterfaceResponse, getMockResponse } from './test-utils';

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

describe('serialiseJsx', () => {
  it('serialises a JSX element', () => {
    expect(
      serialiseJsx(
        <Box>
          <Text>Hello</Text>
        </Box>,
        0,
      ),
    ).toMatchInlineSnapshot(`
      "<Box>
        <Text>
          Hello
        </Text>
      </Box>"
    `);
  });

  it('serialises a JSX element with props', () => {
    expect(
      serialiseJsx(
        <Form name="foo">
          <Field label="Foo">
            <Input name="input" type="text" />
            <Button variant="primary">Primary button</Button>
          </Field>
          <Field label="Bar">
            <Input name="input" type="text" />
            <Button variant="destructive">Secondary button</Button>
          </Field>
        </Form>,
        0,
      ),
    ).toMatchInlineSnapshot(`
      "<Form name="foo">
        <Field label="Foo">
          <Input name="input" type="text" />
          <Button variant="primary">
            Primary button
          </Button>
        </Field>
        <Field label="Bar">
          <Input name="input" type="text" />
          <Button variant="destructive">
            Secondary button
          </Button>
        </Field>
      </Form>"
    `);
  });

  it('serialises a JSX element with non-string props', () => {
    expect(
      serialiseJsx(
        // @ts-expect-error - Invalid prop.
        <Box foo={0} />,
      ),
    ).toMatchInlineSnapshot(`"<Box foo={0} />"`);
  });

  it('serialises a JSX element with null children', () => {
    expect(serialiseJsx(<Box>{null}</Box>)).toMatchInlineSnapshot(`
      "<Box>
      </Box>"
    `);
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
