import { executeLockdown } from '../common/lockdown/lockdown';
import { executeLockdownEvents } from '../common/lockdown/lockdown-events';
import { executeLockdownMore } from '../common/lockdown/lockdown-more';
import { IFrameSnapExecutor } from './IFrameSnapExecutor';

executeLockdownEvents();
executeLockdown();
executeLockdownMore();

IFrameSnapExecutor.initialize();
