import { executeLockdown } from '../common/lockdown/lockdown';
import { executeLockdownMore } from '../common/lockdown/lockdown-more';
import { IFrameSnapExecutor } from './IFrameSnapExecutor';

executeLockdown();
executeLockdownMore();

IFrameSnapExecutor.initialize();
