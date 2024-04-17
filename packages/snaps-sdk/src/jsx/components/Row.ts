import { createSnapComponent } from '../component';
import type { AddressElement } from './Address';
import type { ImageElement } from './Image';
import type { TextElement } from './Text';

/**
 * The props of the {@link Row} component.
 *
 * @property label - The label of the row.
 * @property children - The content of the row. This can be an address, an
 * image, or text.
 * @property variant - The variant of the row.
 */
export type RowProps = {
  label: string;
  children: AddressElement | ImageElement | TextElement;
  variant?: 'default' | 'warning' | 'error';
};

const TYPE = 'row';

/**
 * A row component, which is used to display a row of information.
 *
 * @param props - The props of the component.
 * @param props.label - The label of the row.
 * @param props.children - The content of the row. This can be an address, an
 * image, or text.
 * @param props.variant - The variant of the row.
 * @returns A row element.
 * @example
 * <Row label="From" variant="warning">
 *   <Address address="0x1234567890123456789012345678901234567890" />
 * </Row>
 */
export const Row = createSnapComponent<RowProps, typeof TYPE>(TYPE);

/**
 * A row element.
 *
 * @see Row
 */
export type RowElement = ReturnType<typeof Row>;
