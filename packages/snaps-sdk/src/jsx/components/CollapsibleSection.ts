import type { GenericSnapElement, SnapsChildren } from '../component';
import { createSnapComponent } from '../component';

/**
 * The props of the {@link CollapsibleSection} component.
 *
 * @property children - The children of the collapsible section.
 * @property label - The label of the collapsible section.
 * @property isLoading - Whether the section is still loading.
 * @property isExpanded - Whether the section should start expanded.
 * @property direction - The direction to stack the components within the section. Defaults to `vertical`.
 * @property alignment - The alignment mode to use within the section. Defaults to `start`.
 * @category Component Props
 */
export type CollapsibleSectionProps = {
  // We can't use `JSXElement` because it causes a circular reference.
  children: SnapsChildren<GenericSnapElement>;
  label: string;
  isLoading?: boolean;
  isExpanded?: boolean;
  direction?: 'vertical' | 'horizontal' | undefined;
  alignment?:
    | 'start'
    | 'center'
    | 'end'
    | 'space-between'
    | 'space-around'
    | undefined;
};

const TYPE = 'CollapsibleSection';

/**
 * A collapsible section component, which is used to group multiple components
 * together with a label. The section can be expanded or collapsed by the user.
 *
 * @param props - The props of the component.
 * @param props.children - The children of the collapsible section.
 * @param props.label - The label of the collapsible section.
 * @param props.direction - The direction that the children are aligned.
 * @param props.alignment - The alignment of the children (a justify-content value).
 * @returns A collapsible section element.
 * @example
 * <CollapsibleSection label="Transaction details">
 *   <Row label="From">
 *     <Address address="0x1234567890123456789012345678901234567890" />
 *   </Row>
 *   <Row label="To" variant="warning" tooltip="This address has been deemed dangerous.">
 *     <Address address="0x0000000000000000000000000000000000000000" />
 *   </Row>
 * </CollapsibleSection>
 * @category Components
 */
export const CollapsibleSection = createSnapComponent<
  CollapsibleSectionProps,
  typeof TYPE
>(TYPE);

/**
 * A collapsible section element.
 *
 * @see {@link CollapsibleSection}
 * @category Elements
 */
export type CollapsibleSectionElement = ReturnType<typeof CollapsibleSection>;
