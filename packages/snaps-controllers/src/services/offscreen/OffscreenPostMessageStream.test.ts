import { OffscreenPostMessageStream } from '@metamask/snaps-controllers';
import { MockPostMessageStream } from '@metamask/snaps-utils/test-utils';

import { sleep } from '../../test-utils';

const MOCK_JOB_ID = 'job-id';
const MOCK_FRAME_URL = 'frame-url';

describe('OffScreenPostMessageStream', () => {
  it('wraps messages with an iframe url and job id', async () => {
    const write = jest.fn();

    const mockStream = new MockPostMessageStream(write);
    const stream = new OffscreenPostMessageStream({
      stream: mockStream,
      jobId: MOCK_JOB_ID,
      frameUrl: MOCK_FRAME_URL,
    });

    const message = { foo: 'bar' };
    stream.write(message);

    expect(write).toHaveBeenCalledWith({
      jobId: MOCK_JOB_ID,
      frameUrl: MOCK_FRAME_URL,
      data: message,
    });

    mockStream.destroy();
    stream.destroy();
  });

  it('handles incoming messages with the right job id', async () => {
    const mockStream = new MockPostMessageStream();
    const stream = new OffscreenPostMessageStream({
      stream: mockStream,
      jobId: MOCK_JOB_ID,
      frameUrl: MOCK_FRAME_URL,
    });

    const onData = jest.fn();
    stream.on('data', onData);

    mockStream.write({
      jobId: MOCK_JOB_ID,
      frameUrl: MOCK_FRAME_URL,
      data: { foo: 'bar' },
    });

    // Write a different message with the wrong job ID.
    mockStream.write({
      jobId: 'foo',
      frameUrl: MOCK_FRAME_URL,
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
