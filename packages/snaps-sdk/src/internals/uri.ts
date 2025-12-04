import {
  refine,
  string,
  type,
  assert as assertSuperstruct,
  StructError,
} from '@metamask/superstruct';
import type { Struct } from '@metamask/superstruct';

import { getErrorMessage } from '@metamask/snaps-sdk';

export type UriOptions<Type extends string> = {
  protocol?: Struct<Type>;
  hash?: Struct<Type>;
  port?: Struct<Type>;
  hostname?: Struct<Type>;
  pathname?: Struct<Type>;
  search?: Struct<Type>;
};

export const uri = (opts: UriOptions<any> = {}) =>
  refine(string(), 'uri', (value) => {
    try {
      const url = new URL(value);

      const UrlStruct = type(opts);
      assertSuperstruct(url, UrlStruct);
      return true;
    } catch (error) {
      if (error instanceof StructError) {
        return getErrorMessage(error);
      }
      return `Expected URL, got "${value.toString()}"`;
    }
  });
