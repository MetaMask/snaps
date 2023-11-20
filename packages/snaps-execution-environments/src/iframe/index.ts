// eslint-disable-next-line import/no-unassigned-import
import 'ses';

import { executeLockdownEvents } from '../common/lockdown/lockdown-events';
import { executeLockdownMore } from '../common/lockdown/lockdown-more';
import { IFrameSnapExecutor } from './IFrameSnapExecutor';

lockdown();

// Lockdown is already applied in LavaMoat
executeLockdownMore();
executeLockdownEvents();

IFrameSnapExecutor.initialize();
