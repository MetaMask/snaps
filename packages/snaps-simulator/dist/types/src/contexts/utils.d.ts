import type { InterfaceState } from '@metamask/snaps-sdk';
/**
 * Merge a new input value in the interface state.
 *
 * @param state - The current interface state.
 * @param name - The input name.
 * @param value - The input value.
 * @param form - The name of the form containing the input.
 * Optional if the input is not contained in a form.
 * @returns The interface state with the new value merged in.
 */
export declare const mergeValue: (state: InterfaceState, name: string, value: string | null, form?: string) => InterfaceState;
