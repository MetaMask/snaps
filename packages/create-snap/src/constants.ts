/**
 * The URL for the GitHub repository of the Snaps CLI.
 */
export const GITHUB_ISSUES_URL = 'https://github.com/MetaMask/snaps/issues/new';

/**
 * Metadata for a Snap template.
 */
export type TemplateMetadata = {
  /**
   * The (human-readable) name of the template.
   */
  name: string;

  /**
   * The type of the template. This should match the key in the
   * {@link SUPPORTED_TEMPLATES} object.
   */
  type: string;

  /**
   * A short description of the template.
   */
  description: string;
};

/**
 * The templates supported by the CLI. This should match the templates
 * available in the `templates` directory.
 */
export type Template = keyof typeof SUPPORTED_TEMPLATES;

/**
 * The metadata for the templates supported by the CLI.
 */
export const SUPPORTED_TEMPLATES = {
  minimal: {
    name: 'Minimal',
    type: 'minimal',
    description: 'A minimal template with a basic setup for a Snap.',
  },
  monorepo: {
    name: 'Monorepo',
    type: 'monorepo',
    description:
      'A monorepo template for managing a Snap and web app in a single repository.',
  },
} satisfies Record<string, TemplateMetadata>;
