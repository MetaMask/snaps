import { FunctionComponent } from 'react';
import { Row as RowElement, RowStruct } from '../../elements';
import { Renderer } from '../Renderer';
import { useElement } from './useElement';

import './Row.css';

export type RowProps = {
  element: RowElement;
}

export const Row: FunctionComponent<RowProps> = ({ element }) => {
  const { children } = useElement(element, RowStruct);

  return (
    <div className="row">
      {children?.map((child, index) => <Renderer key={`element-${index}`} element={child} />)}
    </div>
  );
};
