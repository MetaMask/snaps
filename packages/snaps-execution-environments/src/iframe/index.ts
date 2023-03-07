import { executeLockdownMore } from '../common/lockdown/lockdown-more';
import { IFrameSnapExecutor } from './IFrameSnapExecutor';

// Lockdown is already applied in LavaMoat
executeLockdownMore();

IFrameSnapExecutor.initialize();
