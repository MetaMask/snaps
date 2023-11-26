import { decryptImplementation, encryptImplementation } from './encryption';

describe('encryptImplementation', () => {
  it('stringifies the value', () => {
    expect(encryptImplementation('password', 'value')).toBe('"value"');
  });
});

describe('decryptImplementation', () => {
  it('parses the value', () => {
    expect(decryptImplementation('password', '"value"')).toBe('value');
  });
});
