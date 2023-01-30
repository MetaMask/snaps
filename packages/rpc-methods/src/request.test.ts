import { JsonSLIP10Node } from '@metamask/key-tree';
import { RequestedPermissions } from '@metamask/permission-controller';
import { InstallSnapsResult } from '@metamask/snaps-utils';
import { JsonRpcParams } from '@metamask/utils';
import { expectTypeOf } from 'expect-type';

import { MethodRequestArguments, MethodReturnType } from './request';

describe('MethodRequestArguments', () => {
  it('has the proper types for Snaps JSON-RPC methods', () => {
    expectTypeOf<
      MethodRequestArguments<'wallet_requestSnaps'>
    >().toMatchTypeOf<{
      method: 'wallet_requestSnaps';
      params?: RequestedPermissions | undefined;
    }>();

    expectTypeOf<
      MethodRequestArguments<'snap_getBip32Entropy'>
    >().toMatchTypeOf<{
      method: 'snap_getBip32Entropy';
      params?: {
        path: string[];
        curve: string;
      };
    }>();

    expectTypeOf<
      MethodRequestArguments<'wallet_requestSnaps'>
    >().not.toMatchTypeOf<{
      method: 'wallet_requestSnaps';
      params?: unknown[];
    }>();

    expectTypeOf<
      MethodRequestArguments<'snap_getBip32Entropy'>
    >().not.toMatchTypeOf<{
      method: 'snap_getBip32Entropy';
      params?: [
        {
          path: string[];
          curve: string;
        },
      ];
    }>();
  });

  it('supports JSON-RPC methods prefixed with "wallet_"', () => {
    expectTypeOf<MethodRequestArguments<'wallet_foo'>>().toMatchTypeOf<{
      method: 'wallet_foo';
      params?: JsonRpcParams;
    }>();

    expectTypeOf<MethodRequestArguments<'wallet_bar'>>().toMatchTypeOf<{
      method: 'wallet_bar';
      params?: JsonRpcParams;
    }>();

    expectTypeOf<MethodRequestArguments<'wallet_baz'>>().toMatchTypeOf<{
      method: 'wallet_baz';
    }>();

    expectTypeOf<MethodRequestArguments<'wallet_foo'>>().not.toMatchTypeOf<{
      method: 'wallet_bar';
    }>();
  });
});

describe('MethodReturnType', () => {
  it('has the proper types for Snaps JSON-RPC methods', () => {
    expectTypeOf<MethodReturnType<'wallet_requestSnaps'>>().toEqualTypeOf<
      Promise<InstallSnapsResult>
    >();

    expectTypeOf<MethodReturnType<'snap_getBip32Entropy'>>().toEqualTypeOf<
      Promise<JsonSLIP10Node>
    >();
  });

  it('supports JSON-RPC methods prefixed with "wallet_"', () => {
    expectTypeOf<MethodReturnType<'wallet_foo'>>().toEqualTypeOf<
      Promise<unknown>
    >();

    expectTypeOf<MethodReturnType<'wallet_bar'>>().toEqualTypeOf<
      Promise<unknown>
    >();
  });
});
