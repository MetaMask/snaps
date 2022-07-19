import { FunctionComponent } from 'react';
import { Row as RowElement } from '../../elements';
import { Renderer } from '../Renderer';

import './Row.css';

export type RowProps = {
  element: RowElement;
}

export const Row: FunctionComponent<RowProps> = ({ element }) => {
  return (
    <div className="row">
      {element.children?.map((child, index) => <Renderer key={`element-${index}`} element={child} />)}
    </div>
  );
};
