import { executeLockdownMore } from '../common/lockdown/lockdown-more';
import { ChildProcessSnapExecutor } from './ChildProcessSnapExecutor';

// Lockdown is already applied in LavaMoat
executeLockdownMore();

ChildProcessSnapExecutor.initialize();
