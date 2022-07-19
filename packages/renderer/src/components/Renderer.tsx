import { FunctionComponent } from 'react';
import { Element } from '../elements';
import { elements } from './elements';

export type RendererProps = {
  element: Element;
};

export const Renderer: FunctionComponent<RendererProps> = ({ element }) => {
  const Component = elements[element.type] as FunctionComponent<RendererProps>;
  if (!Component) {
    throw new Error(`No component for element type ${element.type}.`);
  }

  return <Component element={element} />;
};
