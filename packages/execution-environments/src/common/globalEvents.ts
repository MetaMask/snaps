import { rootRealmGlobal } from './globalObject';

export function addEventListener(
  event: string,
  listener: (...args: any[]) => void,
) {
  if ('addEventListener' in rootRealmGlobal) {
    return rootRealmGlobal.addEventListener(event, listener);
  }

  if (rootRealmGlobal.process && 'on' in rootRealmGlobal.process) {
    return rootRealmGlobal.process.on(event, listener);
  }

  throw new Error('Platform agnostic addEventListener failed');
}

export function removeEventListener(
  event: string,
  listener: (...args: any[]) => void,
) {
  if ('removeEventListener' in rootRealmGlobal) {
    return rootRealmGlobal.removeEventListener(event, listener);
  }

  if (rootRealmGlobal.process && 'removeListener' in rootRealmGlobal.process) {
    return rootRealmGlobal.process.removeListener(event, listener);
  }

  throw new Error('Platform agnostic removeEventListener failed');
}
