import { executeLockdown } from '../common/lockdown/lockdown';
import { executeLockdownMore } from '../common/lockdown/lockdown-more';
import { ChildProcessSnapExecutor } from './ChildProcessSnapExecutor';

executeLockdown();
executeLockdownMore();

ChildProcessSnapExecutor.initialize();
