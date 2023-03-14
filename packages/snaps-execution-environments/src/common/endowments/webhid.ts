import { rootRealmGlobal } from '../globalObject';

/**
 * Create a {@link navigator} object, with the same properties as the global
 * {@link navigator} object, but only with access to hid.
 *
 * @returns The {@link navigator} object with only access to hid.
 */
function createHID() {
  return {
    navigator: {
      // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/hid
      // https://wicg.github.io/webhid/#dom-navigator-hid
      hid: rootRealmGlobal.navigator?.hid,
    },
  };
}

const endowmentModule = {
  names: ['navigator'] as const,
  factory: createHID,
};

export default endowmentModule;
