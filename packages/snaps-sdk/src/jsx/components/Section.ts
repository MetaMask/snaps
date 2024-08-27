import type { GenericSnapElement, SnapsChildren } from '../component';
import { createSnapComponent } from '../component';

/**
 * The props of the {@link Section} component.
 *
 * @property children - The children of the section.
 */
export type SectionProps = {
  // We can't use `JSXElement` because it causes a circular reference.
  children: SnapsChildren<GenericSnapElement>;
};

const TYPE = 'Section';

/**
 * A section component, which is used to vertically align (flex-direction: column) multiple components together.
 * The component itself is 16px padded with a default background.
 *
 * @param props - The props of the component.
 * @param props.children - The children of the section.
 * @returns A section element.
 * @example
 * <Section>
 *   <Row label="From">
 *     <Address address="0x1234567890123456789012345678901234567890" />
 *   </Row>
 *   <Row label="To" variant="warning" tooltip="This address has been deemed dangerous.">
 *     <Address address="0x0000000000000000000000000000000000000000" />
 *   </Row>
 * </Section>
 */
export const Section = createSnapComponent<SectionProps, typeof TYPE>(TYPE);

/**
 * A section element.
 *
 * @see Section
 */
export type SectionElement = ReturnType<typeof Section>;
