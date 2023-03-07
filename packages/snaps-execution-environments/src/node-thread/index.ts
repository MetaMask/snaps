import { executeLockdownMore } from '../common/lockdown/lockdown-more';
import { ThreadSnapExecutor } from './ThreadSnapExecutor';

// Lockdown is already applied in LavaMoat
executeLockdownMore();

ThreadSnapExecutor.initialize();
