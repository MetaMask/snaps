import { rootRealmGlobal } from '../globalObject';

const MAXIMUM_NOISE = 5;

/**
 * Creates a {@link Date} constructor, with most of the same properties as the global object.
 * The Date.now() function has added noise as to limit its precision and prevent potential timing attacks.
 * The Date constructor uses this now() function to seed itself if no arguments are given to the constructor.
 *
 * @returns A modified {@link Date} constructor with limited precision.
 */
function createDate() {
  const keys = Object.getOwnPropertyNames(
    rootRealmGlobal.Date,
  ) as (keyof typeof Date)[];

  let currentTime = 0;
  const now = () => {
    const actual = rootRealmGlobal.Date.now();
    const noise =
      rootRealmGlobal.crypto.getRandomValues(new Uint32Array(1))[0] %
      MAXIMUM_NOISE;
    const newTime = actual + noise;
    if (newTime > currentTime) {
      currentTime = newTime;
    }
    return currentTime;
  };

  const NewDate = function (...args: unknown[]) {
    return Reflect.construct(
      rootRealmGlobal.Date,
      args.length === 0 ? [now()] : args,
      new.target,
    );
  } as DateConstructor;

  keys.forEach((key) => {
    Reflect.defineProperty(NewDate, key, {
      configurable: false,
      writable: false,
      value: key === 'now' ? now : rootRealmGlobal.Date[key],
    });
  });

  return { Date: NewDate };
}

const endowmentModule = {
  names: ['Date'] as const,
  factory: createDate,
};

export default endowmentModule;
