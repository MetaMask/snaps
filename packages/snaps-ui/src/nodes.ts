import {
  array,
  assign,
  enums,
  Infer,
  lazy,
  literal,
  object,
  optional,
  string,
  Struct,
  union,
  unknown,
} from 'superstruct';

const NodeStruct = object({
  type: string(),
});

/**
 * The base node type.
 *
 * @property type - The node type.
 */
export type Node = Infer<typeof NodeStruct>;

export const FLEX_DIRECTION = {
  ROW: 'row',
  ROW_REVERSE: 'row-reverse',
  COLUMN: 'column',
  COLUMN_REVERSE: 'column-reverse',
} as const;
const validParentFlexDirection = [
  FLEX_DIRECTION.ROW,
  FLEX_DIRECTION.ROW_REVERSE,
  FLEX_DIRECTION.COLUMN,
  FLEX_DIRECTION.COLUMN_REVERSE,
] as const;
export const JUSTIFY_CONTENT = {
  FLEX_END: 'flex-end',
  FLEX_START: 'flex-start',
  CENTER: 'center',
  SPACE_AROUND: 'space-around',
  SPACE_BETWEEN: 'space-between',
  SPACE_EVENLY: 'space-evenly',
} as const;
const validParentJustifyContent = [
  JUSTIFY_CONTENT.FLEX_START,
  JUSTIFY_CONTENT.CENTER,
  JUSTIFY_CONTENT.FLEX_END,
  JUSTIFY_CONTENT.SPACE_AROUND,
  JUSTIFY_CONTENT.SPACE_BETWEEN,
  JUSTIFY_CONTENT.SPACE_EVENLY,
] as const;
const ParentStruct = assign(
  NodeStruct,
  object({
    // This node references itself indirectly, so we need to use `lazy()`.
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    children: array(lazy(() => ComponentStruct)),
    flexDirection: optional(enums(validParentFlexDirection)),
    justifyContent: optional(enums(validParentJustifyContent)),
  }),
);

/**
 * A node with children.
 *
 * @property type - The node type.
 * @property children - The children of this node.
 */
export type Parent = Infer<typeof ParentStruct>;

const LiteralStruct = assign(
  NodeStruct,
  object({
    value: unknown(),
  }),
);

/**
 * A node with a value.
 *
 * @property type - The node type.
 * @property value - The value of this node.
 */
export type Literal = Infer<typeof LiteralStruct>;

export enum NodeType {
  Copyable = 'copyable',
  Divider = 'divider',
  Heading = 'heading',
  Panel = 'panel',
  Spinner = 'spinner',
  Text = 'text',
}

export const CopyableStruct = assign(
  LiteralStruct,
  object({
    type: literal(NodeType.Copyable),
    value: string(),
  }),
);

/**
 * Text that can be copied to the clipboard.
 *
 * @property type - The type of the node, must be the string 'copyable'.
 * @property value - The text to be copied.
 */
export type Copyable = Infer<typeof CopyableStruct>;

export const DividerStruct = assign(
  NodeStruct,
  object({
    type: literal(NodeType.Divider),
  }),
);

/**
 * A divider node, that renders a line between other nodes.
 */
export type Divider = Infer<typeof DividerStruct>;

export const VARIANT = {
  H1: 'h1',
  H2: 'h2',
  H3: 'h3',
  H4: 'h4',
  H5: 'h5',
  H6: 'h6',
  H7: 'h7',
  H8: 'h8',
  H9: 'h9',
} as const;
const validTextVariants = [
  VARIANT.H1,
  VARIANT.H2,
  VARIANT.H3,
  VARIANT.H4,
  VARIANT.H5,
  VARIANT.H6,
  VARIANT.H7,
  VARIANT.H8,
  VARIANT.H9,
] as const;
export const FONT_WEIGHT = {
  NORMAL: 'normal',
  MEDIUM: 'medium',
  BOLD: 'bold',
} as const;
const validTextFontWeight = [
  FONT_WEIGHT.NORMAL,
  FONT_WEIGHT.MEDIUM,
  FONT_WEIGHT.BOLD,
] as const;
export const HeadingStruct = assign(
  LiteralStruct,
  object({
    type: literal(NodeType.Heading),
    value: string(),
    variant: optional(enums(validTextVariants)),
    fontWeight: optional(enums(validTextFontWeight)),
  }),
);

/**
 * A heading node, that renders the text as a heading. The level of the heading
 * is determined by the depth of the heading in the document.
 *
 * @property type - The type of the node, must be the string 'text'.
 * @property value - The text content of the node, either as plain text, or as a
 * markdown string.
 * @property {validTextVariants} [variant] - Set the text variant.
 * @property {validTextFontWeight} [fontWeight] - Set the Flex Direction of a node.
 */
export type Heading = Infer<typeof HeadingStruct>;

export const PanelStruct: Struct<Panel> = assign(
  ParentStruct,
  object({
    type: literal(NodeType.Panel),
    flexDirection: optional(enums(validParentFlexDirection)),
    justifyContent: optional(enums(validParentJustifyContent)),
  }),
);

/**
 * A panel node, which renders its children.
 *
 * @property type - The type of the node, must be the string 'text'.
 * @property value - The text content of the node, either as plain text, or as a
 * markdown string.
 * @property {validParentFlexDirection} [flexDirection] - Set the Flex Direction of a node.
 * @property {validParentJustifyContent} [justifyContent] - Set the Justify Content of a node.
 */
// This node references itself indirectly, so it cannot be inferred.
export type Panel = {
  type: NodeType.Panel;
  children: Component[];
  flexDirection?: typeof validParentFlexDirection[number];
  justifyContent?: typeof validParentJustifyContent[number];
};

export const SpinnerStruct = assign(
  NodeStruct,
  object({
    type: literal(NodeType.Spinner),
  }),
);

/**
 * A spinner node, that renders a spinner, either as a full-screen overlay, or
 * inline when nested inside a {@link Panel}.
 */
export type Spinner = Infer<typeof SpinnerStruct>;

export const TEXT_COLOR = {
  TEXT_DEFAULT: 'text-default',
  TEXT_ALTERNATIVE: 'text-alternative',
  TEXT_MUTED: 'text-muted',
  PRIMARY_DEFAULT: 'primary-default',
  ERROR_DEFAULT: 'error-default',
  SUCCESS_DEFAULT: 'success-default',
  WARNING_DEFAULT: 'warning-default',
  INFO_DEFAULT: 'info-default',
} as const;
const validTextColors = [
  TEXT_COLOR.TEXT_DEFAULT,
  TEXT_COLOR.TEXT_ALTERNATIVE,
  TEXT_COLOR.TEXT_MUTED,
  TEXT_COLOR.PRIMARY_DEFAULT,
  TEXT_COLOR.ERROR_DEFAULT,
  TEXT_COLOR.SUCCESS_DEFAULT,
  TEXT_COLOR.WARNING_DEFAULT,
  TEXT_COLOR.INFO_DEFAULT,
] as const;
export const TextStruct = assign(
  LiteralStruct,
  object({
    type: literal(NodeType.Text),
    value: string(),
    color: optional(enums(validTextColors)),
  }),
);

/**
 * A text node, that renders the text as one or more paragraphs.
 *
 * @property type - The type of the node, must be the string 'text'.
 * @property value - The text content of the node, either as plain text, or as a
 * markdown string.
 * @property {validTextColors} [color] - Set the text color of available colors (import **TEXT_COLOR** for type safety).
 */
export type Text = Infer<typeof TextStruct>;

export const ComponentStruct = union([
  CopyableStruct,
  DividerStruct,
  HeadingStruct,
  PanelStruct,
  SpinnerStruct,
  TextStruct,
]);

/**
 * All supported component types.
 */
export type Component = Infer<typeof ComponentStruct>;
