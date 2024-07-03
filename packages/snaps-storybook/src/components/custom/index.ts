import { Extension } from './Extension';
import { ThemeProvider } from './ThemeProvider';

/**
 * The custom components for the Snaps renderer.
 *
 * This is defined separate from the Snaps components to avoid circular
 * dependencies.
 */
export const CUSTOM_COMPONENTS = {
  Extension,
  ThemeProvider,
};
