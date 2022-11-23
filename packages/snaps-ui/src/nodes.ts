import {
  array,
  assign,
  Infer,
  lazy,
  literal,
  object,
  string,
  Struct,
  union,
} from 'superstruct';

export const NodeStruct = object({
  type: string(),
});

export type Node = {
  type: string;
};

export enum NodeType {
  Copyable = 'copyable',
  Divider = 'divider',
  Heading = 'heading',
  Panel = 'panel',
  Spacer = 'spacer',
  Spinner = 'spinner',
  Text = 'text',
}

export const CopyableStruct = object({
  type: literal(NodeType.Copyable),
  text: string(),
});

/**
 * Text that can be copied to the clipboard.
 */
export type Copyable = Infer<typeof CopyableStruct>;

export const DividerStruct = object({
  type: literal(NodeType.Divider),
});

/**
 * A divider node, that renders a line between other nodes.
 */
export type Divider = Infer<typeof DividerStruct>;

export const HeadingStruct = object({
  type: literal(NodeType.Heading),
  text: string(),
});

/**
 * A heading node, that renders the text as a heading. The level of the heading
 * is determined by the depth of the heading in the document.
 *
 * @property type - The type of the node, must be the string 'text'.
 * @property text - The text content of the node, either as plain text, or as a
 * markdown string.
 */
export type Heading = Infer<typeof HeadingStruct>;

export const PanelStruct: Struct<Panel> = assign(
  NodeStruct,
  object({
    type: literal(NodeType.Panel),

    // This node references itself indirectly, so we need to use `lazy()`.
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    children: lazy(() => array(ComponentStruct)),
  }),
) as unknown as Struct<Panel>;

/**
 * A panel node, which renders its children.
 *
 * @property type - The type of the node, must be the string 'text'.
 * @property text - The text content of the node, either as plain text, or as a
 * markdown string.
 */
// This node references itself indirectly, so it cannot be inferred.
export type Panel = { type: NodeType.Panel; children: Component[] };

export const SpacerStruct = object({
  type: literal(NodeType.Spacer),
});

/**
 * A spacer node, that renders a blank space between other nodes.
 */
export type Spacer = Infer<typeof SpacerStruct>;

export const SpinnerStruct = object({
  type: literal(NodeType.Spinner),
});

/**
 * A spinner node, that renders a spinner, either as a full-screen overlay, or
 * inline when nested inside a {@link Panel}.
 */
export type Spinner = Infer<typeof SpinnerStruct>;

export const TextStruct = assign(
  NodeStruct,
  object({
    type: literal(NodeType.Text),
    text: string(),
  }),
);

/**
 * A text node, that renders the text as one or more paragraphs.
 *
 * @property type - The type of the node, must be the string 'text'.
 * @property text - The text content of the node, either as plain text, or as a
 * markdown string.
 */
export type Text = Infer<typeof TextStruct>;

export const ComponentStruct = union([
  CopyableStruct,
  DividerStruct,
  HeadingStruct,
  PanelStruct,
  SpacerStruct,
  SpinnerStruct,
  TextStruct,
]);

/**
 * All supported component types.
 */
export type Component = Infer<typeof ComponentStruct>;
