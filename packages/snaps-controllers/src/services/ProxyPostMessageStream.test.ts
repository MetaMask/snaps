import { MockPostMessageStream, sleep } from '@metamask/snaps-utils/test-utils';

import { ProxyPostMessageStream } from './ProxyPostMessageStream';

const MOCK_JOB_ID = 'job-id';
const MOCK_FRAME_URL = 'frame-url';

describe('ProxyPostMessageStream', () => {
  it('wraps messages with an iframe url and job id', async () => {
    const write = jest.fn();

    const mockStream = new MockPostMessageStream(write);
    const stream = new ProxyPostMessageStream({
      stream: mockStream,
      jobId: MOCK_JOB_ID,
      extra: {
        frameUrl: MOCK_FRAME_URL,
      },
    });

    const message = { foo: 'bar' };
    stream.write(message);

    expect(write).toHaveBeenCalledWith({
      jobId: MOCK_JOB_ID,
      data: message,
      extra: {
        frameUrl: MOCK_FRAME_URL,
      },
    });

    mockStream.destroy();
    stream.destroy();
  });

  it('handles incoming messages with the right job id', async () => {
    const mockStream = new MockPostMessageStream();
    const stream = new ProxyPostMessageStream({
      stream: mockStream,
      jobId: MOCK_JOB_ID,
    });

    const onData = jest.fn();
    stream.on('data', onData);

    mockStream.write({
      jobId: MOCK_JOB_ID,
      data: { foo: 'bar' },
    });

    // Write a different message with the wrong job ID.
    mockStream.write({
      jobId: 'foo',
      data: {
        bar: 'baz',
      },
    });

    await sleep(1);

    expect(onData).toHaveBeenCalledTimes(1);
    expect(onData).toHaveBeenCalledWith({ foo: 'bar' });
    expect(onData).not.toHaveBeenCalledWith({ bar: 'baz' });

    mockStream.destroy();
    stream.destroy();
  });
});
