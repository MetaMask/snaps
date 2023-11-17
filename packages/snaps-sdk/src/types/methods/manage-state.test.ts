import type { Json } from '@metamask/utils';
import { expectTypeOf } from 'expect-type';

import type {
  ClearStateOperation,
  GetStateOperation,
  ManageStateParams,
  UpdateStateOperation,
} from './manage-state';
import { ManageStateOperation } from './manage-state';

describe('ManageStateOperation', () => {
  it('has the correct values', () => {
    expect(Object.values(ManageStateOperation)).toHaveLength(3);
    expect(ManageStateOperation.ClearState).toBe('clear');
    expect(ManageStateOperation.GetState).toBe('get');
    expect(ManageStateOperation.UpdateState).toBe('update');
  });
});

describe('ClearStateOperation', () => {
  it('accepts the type as enum', () => {
    expectTypeOf<{
      operation: ManageStateOperation.ClearState;
    }>().toMatchTypeOf<ClearStateOperation>();
  });

  it('accepts the type as string', () => {
    expectTypeOf<{
      operation: 'clear';
    }>().toMatchTypeOf<ClearStateOperation>();
  });

  it('does not accept other types', () => {
    expectTypeOf<{
      operation: ManageStateOperation.GetState;
    }>().not.toMatchTypeOf<ClearStateOperation>();

    expectTypeOf<{
      operation: 'get';
    }>().not.toMatchTypeOf<ClearStateOperation>();
  });
});

describe('GetStateOperation', () => {
  it('accepts the type as enum', () => {
    expectTypeOf<{
      operation: ManageStateOperation.GetState;
    }>().toMatchTypeOf<GetStateOperation>();
  });

  it('accepts the type as string', () => {
    expectTypeOf<{
      operation: 'get';
    }>().toMatchTypeOf<GetStateOperation>();
  });

  it('does not accept other types', () => {
    expectTypeOf<{
      operation: ManageStateOperation.ClearState;
    }>().not.toMatchTypeOf<GetStateOperation>();

    expectTypeOf<{
      operation: 'clear';
    }>().not.toMatchTypeOf<GetStateOperation>();
  });
});

describe('UpdateStateOperation', () => {
  it('accepts the type as enum', () => {
    expectTypeOf<{
      operation: ManageStateOperation.UpdateState;
      newState: Record<string, Json>;
    }>().toMatchTypeOf<UpdateStateOperation>();
  });

  it('accepts the type as string', () => {
    expectTypeOf<{
      operation: 'update';
      newState: Record<string, Json>;
    }>().toMatchTypeOf<UpdateStateOperation>();
  });

  it('does not accept other types', () => {
    expectTypeOf<{
      operation: ManageStateOperation.ClearState;
      newState: Record<string, Json>;
    }>().not.toMatchTypeOf<UpdateStateOperation>();

    expectTypeOf<{
      operation: 'clear';
      newState: Record<string, Json>;
    }>().not.toMatchTypeOf<UpdateStateOperation>();
  });
});

describe('ManageStateParams', () => {
  it('accepts the type as enum', () => {
    expectTypeOf<{
      operation: ManageStateOperation.ClearState;
    }>().toMatchTypeOf<ManageStateParams>();
  });

  it('accepts the type as string', () => {
    expectTypeOf<{
      operation: 'clear';
    }>().toMatchTypeOf<ManageStateParams>();
  });
});
