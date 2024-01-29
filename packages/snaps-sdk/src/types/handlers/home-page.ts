import type { Component } from '../../ui';

/**
 * The `onHomePage` handler. This is called when the user navigates to the
 * Snap's home page in the MetaMask UI.
 *
 * This function does not receive any arguments.
 *
 * @returns The content to display on the home page. See
 * {@link OnHomePageResponse}.
 */
export type OnHomePageHandler = () => Promise<OnHomePageResponse>;

/**
 * The content to display on the home page.
 *
 * @property content - A custom UI component, that will be shown in MetaMask.
 * @property id - A custom UI interface ID, that will be shown in MetaMask.
 */
export type OnHomePageResponse =
  | {
      content: Component;
    }
  | { id: string };
