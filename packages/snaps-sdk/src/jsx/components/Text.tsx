import type { SnapComponent } from '../component';
import type { BoldElement } from './formatting';

export type TextChildren = string | BoldElement | TextChildren[];

export type TextProps = {
  children?: TextChildren;
};

export type TextElement = ReturnType<typeof Text>;

/**
 * A text component, which is used to render text.
 *
 * @param props - The props of the component.
 * @param props.key - The key of the component.
 * @param props.children - The text to render.
 * @returns A text element.
 */
export const Text: SnapComponent<TextProps, 'text'> = ({
  key = null,
  ...props
}) => {
  return {
    type: 'text',
    props,
    key,
  };
};
