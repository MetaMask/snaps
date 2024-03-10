import type { SnapComponent, SnapElement } from '../component';

export type PanelProps = {
  children?: SnapElement<any>;
};

export const Panel: SnapComponent<PanelProps> = ({ key = null, ...props }) => {
  return {
    type: 'panel',
    props,
    key,
  };
};
