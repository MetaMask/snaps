import type { BoldProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import type { RenderProps } from '../../Renderer';

export const Bold: FunctionComponent<RenderProps<BoldProps>> = ({
  children,
  Renderer,
}) => (
  <b>
    <Renderer id="bold" element={children} />
  </b>
);
