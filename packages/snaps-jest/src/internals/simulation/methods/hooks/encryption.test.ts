import { decryptImplementation, encryptImplementation } from './encryption';

describe('encryptImplementation', () => {
  it('stringifies the value', () => {
    expect(encryptImplementation('password', 'value')).toBe(
      '{"password":"password","value":"value"}',
    );
  });
});

describe('decryptImplementation', () => {
  it('parses the value', () => {
    expect(
      decryptImplementation(
        'password',
        '{"password":"password","value":"value"}',
      ),
    ).toBe('value');
  });

  it('throws an error if the password is incorrect', () => {
    expect(() =>
      decryptImplementation(
        'incorrect password',
        '{"password":"password","value":"value"}',
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      '"Incorrect password. This is a bug in `@metamask/snaps-jest`, please report it."',
    );
  });
});
