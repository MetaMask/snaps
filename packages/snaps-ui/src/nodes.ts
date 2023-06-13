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

const ParentStruct = assign(
  NodeStruct,
  object({
    // This node references itself indirectly, so we need to use `lazy()`.
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    children: array(lazy(() => ComponentStruct)),
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
  Button = 'button',
  Form = 'form',
  Label = 'label',
  Input = 'input',
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

export const HeadingStruct = assign(
  LiteralStruct,
  object({
    type: literal(NodeType.Heading),
    value: string(),
  }),
);

/**
 * A heading node, that renders the text as a heading. The level of the heading
 * is determined by the depth of the heading in the document.
 *
 * @property type - The type of the node, must be the string 'text'.
 * @property value - The text content of the node, either as plain text, or as a
 * markdown string.
 */
export type Heading = Infer<typeof HeadingStruct>;

export const PanelStruct: Struct<Panel> = assign(
  ParentStruct,
  object({
    type: literal(NodeType.Panel),
  }),
);

/**
 * A panel node, which renders its children.
 *
 * @property type - The type of the node, must be the string 'text'.
 * @property value - The text content of the node, either as plain text, or as a
 * markdown string.
 */
// This node references itself indirectly, so it cannot be inferred.
export type Panel = { type: NodeType.Panel; children: Component[] };

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

export const TextStruct = assign(
  LiteralStruct,
  object({
    type: literal(NodeType.Text),
    value: string(),
  }),
);

/**
 * A text node, that renders the text as one or more paragraphs.
 *
 * @property type - The type of the node, must be the string 'text'.
 * @property value - The text content of the node, either as plain text, or as a
 * markdown string.
 */
export type Text = Infer<typeof TextStruct>;

export enum ButtonVariants {
  Primary = 'primary',
  Secondary = 'secondary',
}

export const ButtonStruct = assign(
  LiteralStruct,
  object({
    type: literal(NodeType.Button),
    variant: optional(
      enums([ButtonVariants.Primary, ButtonVariants.Secondary]),
    ),
    value: string(),
    name: optional(string()),
  }),
);

/**
 * A button node, that renders either a primary or a secondary button.
 *
 * @property type - The type of the node, must be the string 'button'.
 * @property variant - The style variant of the node, must be either 'primary' or 'secondary'.
 * @property value - The text content of the node, either as plain text, or as a
 * markdown string.
 * @property name - An optional name to identify the button.
 */
export type Button = Infer<typeof ButtonStruct>;

export const InputStruct = assign(
  NodeStruct,
  object({
    type: literal(NodeType.Input),
    value: optional(string()),
    name: optional(string()),
    placeholder: optional(string()),
  }),
);

export type Input = Infer<typeof InputStruct>;

export const LabelStruct = assign(
  LiteralStruct,
  object({
    type: literal(NodeType.Label),
    value: string(),
    for: string(),
  }),
);

export type Label = Infer<typeof LabelStruct>;

export const FormStruct = assign(
  ParentStruct,
  object({
    type: literal(NodeType.Form),
    name: optional(string()),
  }),
);

export type From = Infer<typeof FormStruct>;

export const ComponentStruct = union([
  CopyableStruct,
  DividerStruct,
  HeadingStruct,
  PanelStruct,
  SpinnerStruct,
  TextStruct,
  ButtonStruct,
  InputStruct,
  LabelStruct,
]);

/**
 * All supported component types.
 */
export type Component = Infer<typeof ComponentStruct>;
