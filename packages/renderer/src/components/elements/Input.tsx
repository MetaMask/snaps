import { FunctionComponent } from 'react';
import { Input as InputElement } from '../../elements';

export type InputProps = {
  element: InputElement;
}

export const Input: FunctionComponent<InputProps> = ({ element }) => {
  return (
    <input placeholder={element.name} value={element.value} />
  );
};
