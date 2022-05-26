import { executeLockdown } from '../common/lockdown/lockdown';
import { executeLockdownMore } from '../common/lockdown/lockdown-more';
import { MobileSnapExecutor } from './MobileSnapExecutor';

executeLockdown();
executeLockdownMore();

(window as any).mobileSnapExecutor = MobileSnapExecutor.initialize();
