import { executeLockdown } from '../common/lockdown/lockdown';
import { executeLockdownMore } from '../common/lockdown/lockdown-more';
import { IFrameController } from './IFrameController';

executeLockdown();
executeLockdownMore();

IFrameController.initialize();
