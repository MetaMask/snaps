import type { OnHomePageHandler } from '@metamask/snaps-types';
import { panel, text, heading } from '@metamask/snaps-ui';

/**
 * Handle incoming home page requests from the MetaMask clients.
 *
 * @returns A static panel rendered with custom UI.
 * @see https://docs.metamask.io/snaps/reference/exports/#onhomepage
 */
export const onHomePage: OnHomePageHandler = async () => {
  return {
    content: panel([
      heading('Hello world!'),
      text('Welcome to my Snap home page!'),
    ]),
  };
};
