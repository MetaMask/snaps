import { AuxiliaryFileEncoding } from './get-file';

describe('AuxiliaryFileEncoding', () => {
  it('has the correct values', () => {
    expect(Object.values(AuxiliaryFileEncoding)).toHaveLength(3);
    expect(AuxiliaryFileEncoding.Base64).toBe('base64');
    expect(AuxiliaryFileEncoding.Hex).toBe('hex');
    expect(AuxiliaryFileEncoding.Utf8).toBe('utf8');
  });
});
