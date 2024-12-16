import type { ComponentOrElement } from '..';

/**
 * The `onSettingsPage` handler. This is called when the user navigates to the
 * Snap's settings page in the MetaMask UI.
 *
 * This function does not receive any arguments.
 *
 * @returns The content to display on the settings page. See
 * {@link OnSettingsPageResponse}.
 */
export type OnSettingsPageHandler = () => Promise<OnSettingsPageResponse>;

/**
 * The content to display on the settings page.
 *
 * @property content - A custom UI component, that will be shown in MetaMask.
 * @property id - A custom UI interface ID, that will be shown in MetaMask.
 */
export type OnSettingsPageResponse =
  | {
      content: ComponentOrElement;
    }
  | { id: string };
