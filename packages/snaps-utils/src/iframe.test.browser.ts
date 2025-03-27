import { describe, expect, it, afterEach } from 'vitest';

import { createWindow } from './iframe';

const IFRAME_URL = `http://localhost:4569`;

const MOCK_JOB_ID = 'job-id';

describe('createWindow', () => {
  afterEach(() => {
    const iframe = document.getElementById(MOCK_JOB_ID);
    if (iframe) {
      document.body.removeChild(iframe);
    }
  });

  it('creates an iframe window with the provided job ID as the iframe ID', async () => {
    const window = await createWindow({ uri: IFRAME_URL, id: MOCK_JOB_ID });
    const iframe = document.getElementById(MOCK_JOB_ID) as HTMLIFrameElement;

    expect(iframe).toBeDefined();
    expect(iframe.contentWindow).toBe(window);
    expect(iframe.id).toBe(MOCK_JOB_ID);
  });

  it('sets the sandbox attribute when the sandbox option is true', async () => {
    await createWindow({ uri: IFRAME_URL, id: MOCK_JOB_ID, sandbox: true });
    const iframe = document.getElementById(MOCK_JOB_ID) as HTMLIFrameElement;

    expect(iframe).toBeDefined();
    expect(iframe.getAttribute('sandbox')).toBe('allow-scripts');
  });

  it('does not set the sandbox attribute when the sandbox option is false', async () => {
    await createWindow({ uri: IFRAME_URL, id: MOCK_JOB_ID, sandbox: false });
    const iframe = document.getElementById(MOCK_JOB_ID) as HTMLIFrameElement;

    expect(iframe).toBeDefined();
    expect(iframe.getAttribute('sandbox')).toBeNull();
  });

  it('sets the data-testid attribute when provided', async () => {
    const testId = 'test-id';

    await createWindow({
      uri: IFRAME_URL,
      id: MOCK_JOB_ID,
      testId,
    });
    const iframe = document.getElementById(MOCK_JOB_ID) as HTMLIFrameElement;

    expect(iframe).toBeDefined();
    expect(iframe.getAttribute('data-testid')).toBe(testId);
  });

  it('uses the default data-testid attribute when not provided', async () => {
    await createWindow({ uri: IFRAME_URL, id: MOCK_JOB_ID });
    const iframe = document.getElementById(MOCK_JOB_ID) as HTMLIFrameElement;

    expect(iframe).toBeDefined();
    expect(iframe.getAttribute('data-testid')).toBe('snaps-iframe');
  });
});
