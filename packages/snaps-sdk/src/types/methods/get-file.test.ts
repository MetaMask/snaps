import { expectTypeOf } from 'expect-type';

import type { GetFileParams } from './get-file';
import { AuxiliaryFileEncoding } from './get-file';

describe('AuxiliaryFileEncoding', () => {
  it('has the correct values', () => {
    expect(Object.values(AuxiliaryFileEncoding)).toHaveLength(3);
    expect(AuxiliaryFileEncoding.Base64).toBe('base64');
    expect(AuxiliaryFileEncoding.Hex).toBe('hex');
    expect(AuxiliaryFileEncoding.Utf8).toBe('utf8');
  });
});

describe('GetFileParams', () => {
  it('accepts the type as enum', () => {
    expectTypeOf<{
      path: string;
      encoding: AuxiliaryFileEncoding.Hex;
    }>().toMatchTypeOf<GetFileParams>();
  });

  it('accepts the type as string', () => {
    expectTypeOf<{
      path: string;
      encoding: 'hex';
    }>().toMatchTypeOf<GetFileParams>();
  });
});
