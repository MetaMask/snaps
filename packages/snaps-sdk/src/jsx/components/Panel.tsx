import type { SnapComponent, SnapElement } from '../component';

export type PanelProps = {
  children?: SnapElement;
};

export type PanelElement = ReturnType<typeof Panel>;

/**
 * A panel component, which is used to group other components together.
 *
 * @param props - The props of the component.
 * @param props.key - The key of the component.
 * @param props.children - The children to render inside the panel.
 * @returns A panel element.
 */
export const Panel: SnapComponent<PanelProps, 'panel'> = ({
  key = null,
  ...props
}) => {
  return {
    type: 'panel',
    props,
    key,
  };
};
