import { WebWorkerPostMessageStream } from '@metamask/post-message-stream';

import { executeLockdownEvents } from '../../common/lockdown/lockdown-events';
import { executeLockdownMore } from '../../common/lockdown/lockdown-more';
import { WebWorkerSnapExecutor } from './WebWorkerSnapExecutor';

// Lockdown is already applied in LavaMoat
executeLockdownMore();
executeLockdownEvents();

WebWorkerSnapExecutor.initialize(new WebWorkerPostMessageStream());
