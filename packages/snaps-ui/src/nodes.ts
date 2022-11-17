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
  Panel = 'panel',
  Text = 'text',
}

export const PanelStruct: Struct<Panel> = assign(
  NodeStruct,
  object({
    type: literal(NodeType.Panel),

    // This node references itself indirectly, so we need to use `lazy()`.
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    children: lazy(() => array(AnyNodeStruct)),
  }),
) as unknown as Struct<Panel>;

export type Panel = { type: NodeType.Panel; children: Component };

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

export type Component = Panel | Text;
export const AnyNodeStruct = union([PanelStruct, TextStruct]);
