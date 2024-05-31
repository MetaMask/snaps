import type { JSXElement } from '@metamask/snaps-sdk/jsx-runtime';
import type { FunctionComponent } from 'react';

import { SnapInterfaceContextProvider } from '../../contexts';
import { generateKey } from '../../utils';
import { SnapComponent } from './SnapComponent';

type RendererProps = {
  content: JSXElement;
};

/**
 * A UI renderer for Snaps UI.
 *
 * @param props - The component props.
 * @param props.interfaceId - The interface ID.
 * @param props.id - The component ID, to be used as a prefix for component
 * keys.
 * @param props.content
 * @returns The renderer component.
 */
export const Renderer: FunctionComponent<RendererProps> = ({ content }) => {
  const id = generateKey({}, content);
  console.log(content);
  return (
    <SnapInterfaceContextProvider>
      <SnapComponent node={content} id={id} />
    </SnapInterfaceContextProvider>
  );
};
