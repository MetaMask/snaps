//------------------------
// Notice that, compared to the rest of the package, we're including ses directly here, instead of just referencing types.
// This is because IFrame has ses included as a seperate <script> tag, while WebWorkers is just one file.
// We ensure ses is the first thing to be executed in the index file of WebWorker code
/* eslint-disable-next-line import/no-unassigned-import */
import 'ses';
//------------------------
import { executeLockdown } from '../common/lockdown/lockdown';
import { executeLockdownMore } from '../common/lockdown/lockdown-more';
import { WebWorkerSnapExecutor } from './WebWorkerSnapExecutor';

executeLockdown();
executeLockdownMore();

WebWorkerSnapExecutor.initalize();
