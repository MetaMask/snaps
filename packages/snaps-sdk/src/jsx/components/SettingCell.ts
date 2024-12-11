import {
  createSnapComponent,
  type GenericSnapElement,
  type SnapsChildren,
} from '../component';

/**
 * The props of the {@link SettingCell} component.
 *
 * @property title - The title.
 * @property description - The description.
 * @property children - The children to show within the cell.
 */
export type SettingCellProps = {
  title: string;
  description: string;
  children: SnapsChildren<GenericSnapElement>;
};

const TYPE = 'SettingCell';

/**
 * A setting cell component which can be used to display a setting control.
 *
 * @param props - The props of the component.
 * @param props.title - The title.
 * @param props.description - The description.
 * @param props.children - The children to show within the cell.
 * @returns A setting cell element.
 * @example
 * <SettingCell title="Title" description="Description">
 *  <Input name="setting1" />
 * </SettingCell>
 */
export const SettingCell = createSnapComponent<SettingCellProps, typeof TYPE>(
  TYPE,
);

/**
 * A setting cell element.
 *
 * @see SettingCell
 */
export type SettingCellElement = ReturnType<typeof SettingCell>;
