import type { GenericSnapElement } from '../component';
import { createSnapComponent } from '../component';

/**
 * The children of a {@link Row} component.
 */
export type RowChildren = GenericSnapElement;

/**
 * The props of the {@link Row} component.
 *
 * @property label - The label of the row.
 * @property children - The content of the row. This can be any component.
 * @property variant - The variant of the row.
 * @property tooltip - An optional tooltip to show for the row.
 * @category Component Props
 */
export type RowProps = {
  label: string;
  children: RowChildren;
  variant?: 'default' | 'warning' | 'critical' | undefined;
  tooltip?: string | undefined;
};

const TYPE = 'Row';

/**
 * A row component, which is used to display a row of information.
 *
 * @param props - The props of the component.
 * @param props.label - The label of the row.
 * @param props.children - The content of the row. This can be an address, an
 * image, or text.
 * @param props.variant - The variant of the row.
 * @param props.tooltip - An optional tooltip to show for the row.
 * @returns A row element.
 * @example
 * <Row label="From" variant="warning" tooltip="This address has been deemed dangerous.">
 *   <Address address="0x1234567890123456789012345678901234567890" />
 * </Row>
 * @category Components
 */
export const Row = createSnapComponent<RowProps, typeof TYPE>(TYPE);

/**
 * A row element.
 *
 * @see {@link Row}
 * @category Elements
 */
export type RowElement = ReturnType<typeof Row>;
