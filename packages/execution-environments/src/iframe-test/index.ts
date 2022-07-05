import { executeLockdown } from '../common/lockdown/lockdown';
import { IFrameSnapExecutor } from '../iframe/IFrameSnapExecutor';

// The testing iframe is run without lockdown-more due to JSDOM incompatibilities
executeLockdown();

IFrameSnapExecutor.initialize();
