import {
  configuration as reducer,
  INITIAL_CONFIGURATION_STATE,
  openConfigurationModal,
  setOpen,
  setSesEnabled,
  setSnapUrl,
  setSrp,
} from './slice';

describe('configuration slice', () => {
  describe('openConfigurationModal', () => {
    it('opens the modal', () => {
      const result = reducer(
        INITIAL_CONFIGURATION_STATE,
        openConfigurationModal(),
      );

      expect(result.open).toBe(true);
    });
  });

  describe('setOpen', () => {
    it('sets the open state', () => {
      const result = reducer(INITIAL_CONFIGURATION_STATE, setOpen(true));

      expect(result.open).toBe(true);
    });
  });

  describe('setSnapUrl', () => {
    it('sets the snap URL', () => {
      const url = 'http://localhost:9090';
      const result = reducer(INITIAL_CONFIGURATION_STATE, setSnapUrl(url));

      expect(result.snapUrl).toStrictEqual(url);
    });
  });

  describe('setSrp', () => {
    it('sets the SRP', () => {
      const srp = 'test test test test test test test test test test test ball';
      const result = reducer(INITIAL_CONFIGURATION_STATE, setSrp(srp));

      expect(result.srp).toStrictEqual(srp);
    });
  });

  describe('setSesEnabled', () => {
    it('sets the SES enabled flag', () => {
      const result = reducer(INITIAL_CONFIGURATION_STATE, setSesEnabled(false));

      expect(result.sesEnabled).toBe(false);
    });
  });
});
