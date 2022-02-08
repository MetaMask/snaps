import { executeLockdown } from '../common/lockdown/lockdown';
import { executeLockdownMore } from '../common/lockdown/lockdown-more';
import { WebWorkerController } from './WebWorkerController';

executeLockdown();
executeLockdownMore();

WebWorkerController.initalize();
