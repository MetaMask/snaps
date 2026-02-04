import type { GenericSnapElement, SnapsChildren } from '../component';
import { createSnapComponent } from '../component';

/**
 * The props of the {@link Section} component.
 *
 * @property children - The children of the section.
 * @category Component Props
 */
export type SectionProps = {
  // We can't use `JSXElement` because it causes a circular reference.
  children: SnapsChildren<GenericSnapElement>;
  direction?: 'vertical' | 'horizontal' | undefined;
  alignment?:
    | 'start'
    | 'center'
    | 'end'
    | 'space-between'
    | 'space-around'
    | undefined;
};

const TYPE = 'Section';

/**
 * A section component, which is used to group multiple components together.
 * The component itself is 16px padded with a default background and a border radius of 8px.
 *
 * @param props - The props of the component.
 * @param props.children - The children of the section.
 * @param props.direction - The direction that the children are aligned.
 * @param props.alignment - The alignment of the children (a justify-content value).
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
 * @category Components
 */
export const Section = createSnapComponent<SectionProps, typeof TYPE>(TYPE);

/**
 * A section element.
 *
 * @see {@link Section}
 * @category Elements
 */
export type SectionElement = ReturnType<typeof Section>;
