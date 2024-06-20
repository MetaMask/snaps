import type { JsonObject, MaybeArray, SnapElement } from '../../component';
import { createSnapComponent } from '../../component';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Text } from '../Text';

/**
 * The children of the {@link Bold} component.
 */
export type BoldChildren = MaybeArray<
  | string
  // We have to specify the type here to avoid a circular reference.
  | SnapElement<JsonObject, 'Italic'>
  | boolean
  | null
>;

/**
 * The props of the {@link Bold} component.
 *
 * @property children - The text to display in bold.
 */
export type BoldProps = {
  children: BoldChildren;
};

const TYPE = 'Bold';

/**
 * A bold component, which is used to display text in bold. This component can
 * only be used as a child of the {@link Text} component.
 *
 * @param props - The props of the component.
 * @param props.children - The text to display in bold.
 * @returns A bold element.
 * @example
 * <Text>
 *   Hello <Bold>world</Bold>!
 * </Text>
 */
export const Bold = createSnapComponent<BoldProps, typeof TYPE>(TYPE);

/**
 * A bold element.
 *
 * @see Bold
 */
export type BoldElement = ReturnType<typeof Bold>;
