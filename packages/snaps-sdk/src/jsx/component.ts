export type Key = string | number;

/**
 * A JSX element.
 *
 * @property type - The type of the element.
 * @property props - The props of the element.
 * @property key - The key of the element.
 */
export type SnapElement<Props = any, Type extends string = string> = {
  type: Type;
  props: Props;
  key: Key | null;
};

/**
 * A JSX node, which can be an element, a string, null, or an array of nodes.
 */
export type SnapNode = SnapElement | string | null | SnapNode[];

/**
 * The props of a JSX component.
 */
export type SnapProps<Props> = Props & {
  key?: Key;
};

/**
 * A JSX component.
 */
export type SnapComponent<
  Props = Record<string, never>,
  Type extends string = string,
> = (props: SnapProps<Props>) => SnapElement<Props, Type>;
