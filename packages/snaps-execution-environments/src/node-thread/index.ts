import { executeLockdown } from '../common/lockdown/lockdown';
import { executeLockdownEvents } from '../common/lockdown/lockdown-events';
import { executeLockdownMore } from '../common/lockdown/lockdown-more';
import { ThreadSnapExecutor } from './ThreadSnapExecutor';

executeLockdownEvents();
executeLockdown();
executeLockdownMore();

ThreadSnapExecutor.initialize();
