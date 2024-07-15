import type { ItalicProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import type { RenderProps } from '../../Renderer';

export const Italic: FunctionComponent<RenderProps<ItalicProps>> = ({
  children,
  Renderer,
}) => (
  <i>
    <Renderer id="italic" element={children} />
  </i>
);
