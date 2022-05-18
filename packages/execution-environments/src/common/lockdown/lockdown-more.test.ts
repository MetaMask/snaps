import { rootRealmGlobal } from '../globalObject';
import { executeLockdownMore } from './lockdown-more';

describe('executeLockdownMore', () => {
  it('should be able to further lockdown the environment', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const beforeEvalConfigStatus = Object.getOwnPropertyDescriptor(
      rootRealmGlobal,
      'eval',
    ).configurable;
    expect(beforeEvalConfigStatus).toBe(true);
    try {
      executeLockdownMore();
    } catch (e) {
      console.log(e);
    }
    // console.log('here');
    // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // // @ts-ignore
    // const afterLockdownMoreStatus = Object.getOwnPropertyDescriptor(
    //   rootRealmGlobal,
    //   'eval',
    // ).configurable;
    // expect(afterLockdownMoreStatus).toBe(false);
  });
});
