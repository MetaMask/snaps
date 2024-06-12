import { createSnapComponent } from '../component';

/**
 * The props of the {@link Cell} component.
 *
 * @property image - The image to show as part of the Cell, must be an SVG string.
 * @property title - The title.
 * @property description - The description, shown below the title.
 * @property value - The value, shown on the right side.
 * @property extra - An additional optional value shown below the value.
 */
export type CellProps = {
  image?: string | undefined;
  title: string;
  description?: string | undefined;
  value: string;
  extra?: string | undefined;
};

const TYPE = 'Cell';

/**
 * A cell component which can be used to display values within a cell structure.
 *
 * @param props - The props of the component.
 * @param props.image - The image to show as part of the Cell, must be an SVG string.
 * @param props.title - The title.
 * @param props.description - The description, shown below the title.
 * @param props.value - The value, shown on the right side.
 * @param props.extra - An additional optional value shown below the value.
 * @returns A box element.
 * @example
 * <Cell image="<svg />" title="Title" description="Description" value="$1200" extra="0.12 ETH" />
 */
export const Cell = createSnapComponent<CellProps, typeof TYPE>(TYPE);

/**
 * A cell element.
 *
 * @see Cell
 */
export type CellElement = ReturnType<typeof Cell>;
