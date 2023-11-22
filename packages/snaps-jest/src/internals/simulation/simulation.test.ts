import { NodeThreadExecutionService } from '@metamask/snaps-controllers';
import { assert } from '@metamask/utils';

import { installSnap } from './simulation';

describe('installSnap', () => {
  it('runs a snap', async () => {
    const snapId = 'npm:@metamask/dialog-example-snap';
    const { request, close } = await installSnap(snapId, {
      executionService: NodeThreadExecutionService,
    });

    const response = request({
      method: 'showPrompt',
    });

    const ui = await response.getInterface();
    assert(ui.type === 'prompt');
    await ui.ok('foo');

    expect(await response).toBe('foo');

    await close();
  });
});
