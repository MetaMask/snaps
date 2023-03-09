import { executeLockdown } from '../common/lockdown/lockdown';
import { executeLockdownEvents } from '../common/lockdown/lockdown-events';
import { executeLockdownMore } from '../common/lockdown/lockdown-more';
import { ChildProcessSnapExecutor } from './ChildProcessSnapExecutor';

executeLockdownEvents();
executeLockdown();
executeLockdownMore();

ChildProcessSnapExecutor.initialize();
