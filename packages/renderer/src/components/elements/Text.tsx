import { FunctionComponent } from 'react';
import { Text as TextElement, TextStruct } from '../../elements';
import { useElement } from './useElement';

export type TextProps = {
  element: TextElement;
}

export const Text: FunctionComponent<TextProps> = ({ element }) => {
  const { value } = useElement(element, TextStruct);

  return (
    <p className="text">
      {value}
    </p>
  );
};
