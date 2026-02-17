import { expectTypeOf } from 'expect-type';

import type {
  ConfirmationDialog,
  PromptDialog,
  AlertDialog,
  DialogParams,
} from './dialog';
import { DialogType } from './dialog';
import type { JSXElement } from '../../jsx';

describe('DialogType', () => {
  it('has the correct values', () => {
    expect(Object.values(DialogType)).toHaveLength(3);
    expect(DialogType.Alert).toBe('alert');
    expect(DialogType.Confirmation).toBe('confirmation');
    expect(DialogType.Prompt).toBe('prompt');
  });
});

describe('AlertDialog', () => {
  it('accepts the type as enum', () => {
    expectTypeOf<{
      type: DialogType.Alert;
      content: JSXElement;
    }>().toMatchTypeOf<AlertDialog>();
  });

  it('accepts the type as string', () => {
    expectTypeOf<{
      type: 'alert';
      content: JSXElement;
    }>().toMatchTypeOf<AlertDialog>();
  });

  it('does not accept other types', () => {
    expectTypeOf<{
      type: DialogType.Confirmation;
      content: JSXElement;
    }>().not.toMatchTypeOf<AlertDialog>();

    expectTypeOf<{
      type: 'confirmation';
      content: JSXElement;
    }>().not.toMatchTypeOf<AlertDialog>();
  });
});

describe('ConfirmationDialog', () => {
  it('accepts the type as enum', () => {
    expectTypeOf<{
      type: DialogType.Confirmation;
      content: JSXElement;
    }>().toMatchTypeOf<ConfirmationDialog>();
  });

  it('accepts the type as string', () => {
    expectTypeOf<{
      type: 'confirmation';
      content: JSXElement;
    }>().toMatchTypeOf<ConfirmationDialog>();
  });

  it('does not accept other types', () => {
    expectTypeOf<{
      type: DialogType.Alert;
      content: JSXElement;
    }>().not.toMatchTypeOf<ConfirmationDialog>();

    expectTypeOf<{
      type: 'alert';
      content: JSXElement;
    }>().not.toMatchTypeOf<ConfirmationDialog>();
  });
});

describe('PromptDialog', () => {
  it('accepts the type as enum', () => {
    expectTypeOf<{
      type: DialogType.Prompt;
      content: JSXElement;
    }>().toMatchTypeOf<PromptDialog>();
  });

  it('accepts the type as string', () => {
    expectTypeOf<{
      type: 'prompt';
      content: JSXElement;
    }>().toMatchTypeOf<PromptDialog>();
  });

  it('does not accept other types', () => {
    expectTypeOf<{
      type: DialogType.Alert;
      content: JSXElement;
    }>().not.toMatchTypeOf<PromptDialog>();

    expectTypeOf<{
      type: 'alert';
      content: JSXElement;
    }>().not.toMatchTypeOf<PromptDialog>();
  });
});

describe('DialogParams', () => {
  it('accepts the type as enum', () => {
    expectTypeOf<{
      type: DialogType.Alert;
      content: JSXElement;
    }>().toMatchTypeOf<DialogParams>();

    expectTypeOf<{
      type: DialogType.Confirmation;
      content: JSXElement;
    }>().toMatchTypeOf<DialogParams>();

    expectTypeOf<{
      type: DialogType.Prompt;
      content: JSXElement;
    }>().toMatchTypeOf<DialogParams>();
  });

  it('accepts the type as string', () => {
    expectTypeOf<{
      type: 'alert';
      content: JSXElement;
    }>().toMatchTypeOf<DialogParams>();

    expectTypeOf<{
      type: 'confirmation';
      content: JSXElement;
    }>().toMatchTypeOf<DialogParams>();

    expectTypeOf<{
      type: 'prompt';
      content: JSXElement;
    }>().toMatchTypeOf<DialogParams>();
  });
});
