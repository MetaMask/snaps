import { FunctionComponent } from 'react';
import { Fragment as FragmentElement } from '../../elements';
import { Renderer } from '../Renderer';

export type FragmentProps = {
  element: FragmentElement;
}

export const Fragment: FunctionComponent<FragmentProps> = ({ element }) => {
  return (
    <>
      {element.children?.map((child, index) => <Renderer key={`element-${index}`} element={child} />)}
    </>
  );
};
