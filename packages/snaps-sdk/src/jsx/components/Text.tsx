import type { SnapComponent } from '../component';

export type TextProps = {
  children?: string;
};

// eslint-disable-next-line @typescript-eslint/no-shadow
export const Text: SnapComponent<TextProps> = ({ key = null, ...props }) => {
  return {
    type: 'text',
    props,
    key,
  };
};
