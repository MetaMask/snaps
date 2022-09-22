describe('MultiChainProvider', () => {
  describe('HACK_multiChainStream', () => {
    it.todo('finds the stream and uses it');
    it.todo('throws an error when not found');
  });

  describe('connect', () => {
    it.todo('validates arguments');
    it.todo('connects');
    it.todo('throws on error response');
  });

  describe('request', () => {
    describe('validation', () => {
      it.todo('throws when not connected');
      it.todo('validates chainId');
      it.todo('validates request');
    });

    it.todo('returns result');
    it.todo('throws on error response');
  });

  describe('events', () => {
    describe('session_update', () => {
      it.todo('is emitted on approve');
      it.todo('is emitted with new session on repeated approve');
      it.todo('is not emitted on approve refuse');
    });

    describe('session_event', () => {
      it.todo('emits events');
    });

    describe('session_delete', () => {
      it.todo('emits delete');
      it.todo('updates connected status');
    });
  });
});
