// eslint-disable-next-line import-x/no-unassigned-import
import 'ses';
import { HandlerType } from '@metamask/snaps-utils';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';
import { describe, expect, it } from 'vitest';

import { NativeExecutionService } from './NativeExecutionService';
import { METAMASK_ORIGIN } from '../../snaps';
import { createService } from '../../test-utils/service';

lockdown({
  domainTaming: 'unsafe',
  errorTaming: 'unsafe',
  stackFiltering: 'verbose',
  overrideTaming: 'severe',
  errorTrapping: 'none',
});

describe('NativeExecutionService', () => {
  it('works', async () => {
    const { service } = createService(NativeExecutionService);

    await service.executeSnap({
      snapId: MOCK_SNAP_ID,
      sourceCode: `module.exports.onRpcRequest = () => { console.log('foo'); return 'bar'; }`,
      endowments: ['console'],
    });

    const result = await service.handleRpcRequest(MOCK_SNAP_ID, {
      origin: METAMASK_ORIGIN,
      request: {
        method: 'foo',
      },
      handler: HandlerType.OnRpcRequest,
    });

    expect(result).toBe('bar');
  });
});
