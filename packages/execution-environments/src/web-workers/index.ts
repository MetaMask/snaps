import { executeLockdown } from '../common/lockdown/lockdown';
import { executeLockdownMore } from '../common/lockdown/lockdown-more';
import { WebWorkerSnapExecutor } from './WebWorkerSnapExecutor';

executeLockdown();
executeLockdownMore();

WebWorkerSnapExecutor.initalize();
