import { FunctionComponent } from 'react';
import { Fragment as FragmentElement, FragmentStruct } from '../../elements';
import { Renderer } from '../Renderer';
import { useElement } from './useElement';

export type FragmentProps = {
  element: FragmentElement;
}

export const Fragment: FunctionComponent<FragmentProps> = ({ element }) => {
  const { children } = useElement(element, FragmentStruct);

  return (
    <>
      {children?.map((child, index) => <Renderer key={`element-${index}`} element={child} />)}
    </>
  );
};
