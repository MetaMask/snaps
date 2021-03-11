export function isPlainObject(value: unknown): value is Record<string | symbol, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

type SelectedHooks<
  Hooks extends Record<keyof HookNames, unknown>,
  HookNames extends Record<string, boolean>,
> = Pick<Hooks, keyof HookNames & keyof Hooks>;

export function selectHooks<
  Hooks extends Record<string, unknown>,
>(hooks: Hooks, hookNames?: void): void;

export function selectHooks<
  Hooks extends Record<keyof HookNames, unknown>,
  HookNames extends Record<string, boolean>,
>(hooks: Hooks, hookNames: HookNames): SelectedHooks<Hooks, HookNames>;

export function selectHooks<
  T extends Record<keyof U, unknown>,
  U extends Record<string, boolean>
>(hooks: T, hookNames?: U) {
  if (hookNames) {
    return Object.keys(hookNames).reduce((hookSubset, _hookName) => {
      const hookName = _hookName as keyof SelectedHooks<T, U>;
      hookSubset[hookName] = hooks[hookName];
      return hookSubset;
    }, {} as SelectedHooks<T, U>);
  }
  return undefined;
}
