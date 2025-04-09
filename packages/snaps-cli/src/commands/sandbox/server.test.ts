import { getMockConfig } from '@metamask/snaps-cli/test-utils';
import fs from 'fs';
import { dirname } from 'path';

import { startSandbox } from './server';

jest.mock('fs');

describe('startSandbox', () => {
  beforeAll(async () => {
    const sandboxPath = require.resolve(
      '@metamask/snaps-sandbox/dist/index.html',
    );

    await fs.promises.mkdir(dirname(sandboxPath), { recursive: true });
    await fs.promises.writeFile(
      sandboxPath,
      '<html><body>Snaps Sandbox</body></html>',
    );
  });

  it('starts the sandbox server', async () => {
    const config = getMockConfig('webpack', {
      server: {
        port: 8080,
      },
    });

    const { port, close } = await startSandbox(config);

    expect(port).toBe(8080);
    expect(close).toBeInstanceOf(Function);

    const response = await fetch('http://localhost:8080');
    expect(response.status).toBe(200);

    const text = await response.text();
    expect(text).toBe('<html><body>Snaps Sandbox</body></html>');

    await close();
  });
});
