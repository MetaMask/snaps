import {
  configuration as reducer,
  INITIAL_CONFIGURATION_STATE,
  openConfigurationModal,
  setOpen,
  setSesEnabled,
  setSrp,
  setSnapId,
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

  describe('setSnapId', () => {
    it('sets the snap URL', () => {
      const id = 'local:http://localhost:9090';
      const result = reducer(INITIAL_CONFIGURATION_STATE, setSnapId(id));

      expect(result.snapId).toStrictEqual(id);
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
