import {
  getSnapChecksum,
  SnapManifest,
  VirtualFile,
} from '@metamask/snaps-utils';
import { assert, SemVerVersion } from '@metamask/utils';
import { Router } from 'express';

import { methodNotAllowed } from './fallback';

let snapBundle = `
const ENCRYPTION_ALGORITHM = 'AES-GCM';
const ENCRYPTION_KEY_LENGTH = 256;
const ENCRYPTION_MESSAGE_LENGTH = 10 ** 6;

module.exports.onRpcRequest = async () => {
  // We can't use \`crypto.getRandomValues\` here because it has a limited amount
  // of entropy. Since this is just a benchmark, we don't care about the
  // security of the random bytes.
  const randomBytes = new Uint8Array(ENCRYPTION_MESSAGE_LENGTH)
    .fill(0)
    .map(() => Math.round(Math.random() * 0xff));

  const privateKey = await crypto.subtle.generateKey(
    { name: ENCRYPTION_ALGORITHM, length: ENCRYPTION_KEY_LENGTH },
    true,
    ['encrypt'],
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  await crypto.subtle.encrypt(
    { name: ENCRYPTION_ALGORITHM, iv },
    privateKey,
    randomBytes,
  );

  return 'OK';
};
`.trim();

/**
 * Router that handles requests to `/`. This can be used to set the source code
 * for a snap, and to load the fake bundle from the extension.
 */
const router = Router();

router.get('/snap.manifest.json', (request, response) => {
  assert(request.socket.localPort);
  const snapId = `benchmark-snap-${request.socket.localPort}`;

  const baseManifest = {
    version: '1.0.0' as SemVerVersion,
    description: 'A snap used for benchmarking purposes.',
    proposedName: snapId,
    repository: {
      type: 'git',
      url: 'https://github.com/MetaMask/snaps-monorepo.git',
    },
    source: {
      shasum: 'dDVOHW17TxI4/mRvvHUb3rfxnv/QGF1ClRdug07IEn4=',
      location: {
        npm: {
          filePath: 'bundle.js',
          packageName: snapId,
          registry: 'https://registry.npmjs.org/' as const,
        },
      },
    },
    initialPermissions: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'endowment:rpc': {
        dapps: true,
      },
    },
    manifestVersion: '0.1' as const,
  };

  const manifest = new VirtualFile<SnapManifest>(JSON.stringify(baseManifest));
  manifest.result = baseManifest;
  manifest.path = 'snap.manifest.json';

  const sourceCode = new VirtualFile(snapBundle);
  sourceCode.path = 'bundle.js';

  const shasum = getSnapChecksum({
    manifest,
    sourceCode,
  });

  response.type('application/json');
  response.json({
    ...manifest.result,
    source: {
      ...manifest.result.source,
      shasum,
    },
  });
});

router.get('/bundle.js', (_request, response) => {
  response.type('application/javascript');
  response.end(snapBundle);
});

router.get('/api/snaps', (_request, response) => {
  response.json({
    status: 'success',
    data: {
      bundle: snapBundle,
    },
  });
});

router.post('/api/snaps', (request, response) => {
  const { sourceCode } = request.body;
  assert(
    typeof sourceCode === 'string',
    'Expected source code to be a string.',
  );

  snapBundle = sourceCode;

  response.json({
    status: 'success',
    data: {
      bundle: snapBundle,
    },
  });
});

router.all('/', methodNotAllowed);

export const snapsRouter = router;
