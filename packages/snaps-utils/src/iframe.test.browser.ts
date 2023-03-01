import { createWindow } from './iframe';

const IFRAME_URL = `http://localhost:4569`;

const MOCK_JOB_ID = 'job-id';

describe('createWindow', () => {
  it('creates an iframe window with the provided job ID as the iframe ID', async () => {
    const window = await createWindow(IFRAME_URL, MOCK_JOB_ID);
    const iframe = document.getElementById(MOCK_JOB_ID) as HTMLIFrameElement;

    expect(iframe).toBeDefined();
    expect(iframe.contentWindow).toBe(window);
    expect(iframe.id).toBe(MOCK_JOB_ID);
  });
});
