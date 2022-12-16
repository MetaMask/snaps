import { executeLockdown } from '../common/lockdown/lockdown';
import { executeLockdownMore } from '../common/lockdown/lockdown-more';
import { OffscreenSnapExecutor } from './OffscreenSnapExecutor';

executeLockdown();
executeLockdownMore();

OffscreenSnapExecutor.initialize();
