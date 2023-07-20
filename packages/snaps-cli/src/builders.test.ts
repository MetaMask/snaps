import builders from './builders';

describe('builders', () => {
  describe('port', () => {
    describe('coerce', () => {
      it('validates the port number', () => {
        expect(() => {
          builders.port.coerce?.('foo');
        }).toThrow('Invalid port: "foo".');
      });

      it('returns the port number', () => {
        expect(builders.port.coerce?.(1234)).toBe(1234);
      });
    });
  });
});
