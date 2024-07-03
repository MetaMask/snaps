import type { ComponentType } from 'react';

import type { Styles } from '../../theme/utils';

/**
 * A component that can be rendered in Storybook.
 */
export type Component = {
  /**
   * The React component to render.
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Component: ComponentType<any>;

  /**
   * The optional Chakra UI styles for the component.
   */
  styles?: Styles;
};
