import { executeLockdownEvents } from '../../common/lockdown/lockdown-events';
import { executeLockdownMore } from '../../common/lockdown/lockdown-more';
import { WebWorkerPool } from './WebWorkerPool';

// Lockdown is already applied in LavaMoat
executeLockdownMore();
executeLockdownEvents();

WebWorkerPool.initialize();
