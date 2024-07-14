import { InputGroup, InputRightElement } from '@chakra-ui/react';
import type { FieldProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';
import { useEffect, useState, useRef } from 'react';

import type { RendererProps } from '../../../Renderer';

/**
 * The props for the {@link Input} component.
 */
export type InputProps = {
  /**
   * The input element to render.
   */
  element: FieldProps['children'];

  /**
   * The renderer to use for the input field.
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Renderer: FunctionComponent<RendererProps>;
};

/**
 * This is a wrapper of the input component, which allows for rendering
 * different types of input fields.
 *
 * @param props - The component props.
 * @param props.element - The input element to render.
 * @param props.Renderer - The renderer to use for the input field.
 * @returns The rendered input component.
 */
export const Input: FunctionComponent<InputProps> = ({ element, Renderer }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    if (ref.current) {
      setWidth(ref.current.offsetWidth);
    }
  }, [element, ref]);

  if (Array.isArray(element)) {
    const [input, button] = element;
    return (
      <InputGroup
        sx={{
          input: {
            paddingRight: `${width}px`,
          },
        }}
      >
        <Renderer id="field-input" element={input} />
        <InputRightElement ref={ref} width="auto" paddingX="4">
          <Renderer id="field-button" element={button} />
        </InputRightElement>
      </InputGroup>
    );
  }

  return <Renderer id="field-input" element={element} />;
};
