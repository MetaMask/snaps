import { executeLockdown } from '../common/lockdown/lockdown';
import { executeLockdownMore } from '../common/lockdown/lockdown-more';
import { ThreadSnapExecutor } from './ThreadSnapExecutor';

executeLockdown();
executeLockdownMore();

ThreadSnapExecutor.initialize();
