import { FunctionComponent } from 'react';
import { Text as TextElement } from '../../elements';

export type TextProps = {
  element: TextElement;
}

export const Text: FunctionComponent<TextProps> = ({ element }) => {
  return (
    <p className="text">
      {element.value}
    </p>
  );
};
