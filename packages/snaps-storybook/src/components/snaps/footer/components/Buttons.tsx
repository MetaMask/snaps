import type { FooterProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import type { RenderProps } from '../../../Renderer';
import { Button } from './Button';
import { CancelButton } from './CancelButton';

/**
 * The footer buttons.
 *
 * @param props - The component props.
 * @param props.children - The footer buttons.
 * @param props.Renderer - The Renderer component to use to render nested
 * elements.
 * @returns The footer buttons element.
 */
export const Buttons: FunctionComponent<RenderProps<FooterProps>> = ({
  children,
  Renderer,
}) => {
  if (Array.isArray(children)) {
    return <Renderer id="footer" element={children} overrides={{ Button }} />;
  }

  return (
    <>
      <CancelButton />
      <Renderer id="footer" element={children} overrides={{ Button }} />
    </>
  );
};
