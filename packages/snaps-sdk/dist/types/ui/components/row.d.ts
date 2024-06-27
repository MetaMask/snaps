import type { Infer } from '@metamask/superstruct';
import { NodeType } from '../nodes';
export declare enum RowVariant {
    Default = "default",
    Critical = "critical",
    Warning = "warning"
}
export declare const RowStruct: import("@metamask/superstruct").Struct<{
    value: {
        value: string;
        type: NodeType.Image;
    } | {
        value: string;
        type: NodeType.Text;
        markdown?: boolean | undefined;
    } | {
        value: `0x${string}`;
        type: NodeType.Address;
    };
    type: NodeType.Row;
    label: string;
    variant?: "default" | "warning" | "critical" | undefined;
}, {
    type: import("@metamask/superstruct").Struct<NodeType.Row, NodeType.Row>;
    variant: import("@metamask/superstruct").Struct<"default" | "warning" | "critical" | undefined, null>;
    label: import("@metamask/superstruct").Struct<string, null>;
    value: import("@metamask/superstruct").Struct<{
        value: string;
        type: NodeType.Image;
    } | {
        value: string;
        type: NodeType.Text;
        markdown?: boolean | undefined;
    } | {
        value: `0x${string}`;
        type: NodeType.Address;
    }, null>;
}>;
/**
 * A row node, that renders a row with a label and a value.
 *
 * @property type - The type of the node. Must be the string `row`.
 * @property label - The label for the row.
 * @property value - A sub component to be rendered
 * on one side of the row.
 * @property variant - Optional variant for styling.
 */
export declare type Row = Infer<typeof RowStruct>;
/**
 * Create a {@link Row} node.
 *
 * @param args - The node arguments. This can either be a string, a component and an optional variant or an object
 * with the properties: `label`, `value` and `variant`.
 * @param args.label - The label for the row.
 * @param args.value - Another component, is currently limited to `image`, `text` and `address`.
 * @param args.variant - An optional variant, either `default`, `warning` or `critical`.
 * @returns The row node as an object.
 * @deprecated Snaps component functions are deprecated, in favor of the new JSX
 * components. This function will be removed in a future release.
 * @example
 * const node = row({ label: 'Address', value: address('0x4bbeeb066ed09b7aed07bf39eee0460dfa261520') });
 * const node = row({ label: 'Address', value: address('0x4bbeeb066ed09b7aed07bf39eee0460dfa261520'), variant: RowVariant.Warning });
 * const node = row('Address', address('0x4bbeeb066ed09b7aed07bf39eee0460dfa261520'));
 * const node = row('Address', address('0x4bbeeb066ed09b7aed07bf39eee0460dfa261520'), RowVariant.Warning);
 */
export declare const row: (...args: [Omit<{
    value: {
        value: string;
        type: NodeType.Image;
    } | {
        value: string;
        type: NodeType.Text;
        markdown?: boolean | undefined;
    } | {
        value: `0x${string}`;
        type: NodeType.Address;
    };
    type: NodeType.Row;
    label: string;
    variant?: "default" | "warning" | "critical" | undefined;
}, "type">] | (string | {
    value: string;
    type: NodeType.Image;
} | {
    value: string;
    type: NodeType.Text;
    markdown?: boolean | undefined;
} | {
    value: `0x${string}`;
    type: NodeType.Address;
} | undefined)[]) => {
    value: {
        value: string;
        type: NodeType.Image;
    } | {
        value: string;
        type: NodeType.Text;
        markdown?: boolean | undefined;
    } | {
        value: `0x${string}`;
        type: NodeType.Address;
    };
    type: NodeType.Row;
    label: string;
    variant?: "default" | "warning" | "critical" | undefined;
};
