import { FunctionComponent } from 'react';
import { FragmentStruct, Input as InputElement, InputStruct } from '../../elements';
import { useElement } from './useElement';

export type InputProps = {
  element: InputElement;
}

export const Input: FunctionComponent<InputProps> = ({ element }) => {
  const { placeholder } = useElement(element, InputStruct);

  return (
    <input placeholder={placeholder} />
  );
};
