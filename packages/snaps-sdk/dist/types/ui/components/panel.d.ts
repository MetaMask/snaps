import type { Infer, Struct } from '@metamask/superstruct';
import { NodeType } from '../nodes';
/**
 * @internal
 */
export declare const ParentStruct: Struct<{
    type: string;
    children: ({
        value: string;
        type: NodeType.Copyable;
        sensitive?: boolean | undefined;
    } | {
        type: NodeType.Divider;
    } | {
        value: string;
        type: NodeType.Heading;
    } | {
        value: string;
        type: NodeType.Image;
    } | Panel | {
        type: NodeType.Spinner;
    } | {
        value: string;
        type: NodeType.Text;
        markdown?: boolean | undefined;
    } | {
        value: `0x${string}`;
        type: NodeType.Address;
    } | {
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
    } | {
        type: NodeType.Input;
        name: string;
        value?: string | undefined;
        error?: string | undefined;
        label?: string | undefined;
        inputType?: "number" | "text" | "password" | undefined;
        placeholder?: string | undefined;
    } | {
        value: string;
        type: NodeType.Button;
        name?: string | undefined;
        variant?: "primary" | "secondary" | undefined;
        buttonType?: "button" | "submit" | undefined;
    } | {
        type: NodeType.Form;
        name: string;
        children: ({
            type: NodeType.Input;
            name: string;
            value?: string | undefined;
            error?: string | undefined;
            label?: string | undefined;
            inputType?: "number" | "text" | "password" | undefined;
            placeholder?: string | undefined;
        } | {
            value: string;
            type: NodeType.Button;
            name?: string | undefined;
            variant?: "primary" | "secondary" | undefined;
            buttonType?: "button" | "submit" | undefined;
        })[];
    })[];
}, {
    children: Struct<({
        value: string;
        type: NodeType.Copyable;
        sensitive?: boolean | undefined;
    } | {
        type: NodeType.Divider;
    } | {
        value: string;
        type: NodeType.Heading;
    } | {
        value: string;
        type: NodeType.Image;
    } | Panel | {
        type: NodeType.Spinner;
    } | {
        value: string;
        type: NodeType.Text;
        markdown?: boolean | undefined;
    } | {
        value: `0x${string}`;
        type: NodeType.Address;
    } | {
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
    } | {
        type: NodeType.Input;
        name: string;
        value?: string | undefined;
        error?: string | undefined;
        label?: string | undefined;
        inputType?: "number" | "text" | "password" | undefined;
        placeholder?: string | undefined;
    } | {
        value: string;
        type: NodeType.Button;
        name?: string | undefined;
        variant?: "primary" | "secondary" | undefined;
        buttonType?: "button" | "submit" | undefined;
    } | {
        type: NodeType.Form;
        name: string;
        children: ({
            type: NodeType.Input;
            name: string;
            value?: string | undefined;
            error?: string | undefined;
            label?: string | undefined;
            inputType?: "number" | "text" | "password" | undefined;
            placeholder?: string | undefined;
        } | {
            value: string;
            type: NodeType.Button;
            name?: string | undefined;
            variant?: "primary" | "secondary" | undefined;
            buttonType?: "button" | "submit" | undefined;
        })[];
    })[], Struct<{
        value: string;
        type: NodeType.Copyable;
        sensitive?: boolean | undefined;
    } | {
        type: NodeType.Divider;
    } | {
        value: string;
        type: NodeType.Heading;
    } | {
        value: string;
        type: NodeType.Image;
    } | Panel | {
        type: NodeType.Spinner;
    } | {
        value: string;
        type: NodeType.Text;
        markdown?: boolean | undefined;
    } | {
        value: `0x${string}`;
        type: NodeType.Address;
    } | {
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
    } | {
        type: NodeType.Input;
        name: string;
        value?: string | undefined;
        error?: string | undefined;
        label?: string | undefined;
        inputType?: "number" | "text" | "password" | undefined;
        placeholder?: string | undefined;
    } | {
        value: string;
        type: NodeType.Button;
        name?: string | undefined;
        variant?: "primary" | "secondary" | undefined;
        buttonType?: "button" | "submit" | undefined;
    } | {
        type: NodeType.Form;
        name: string;
        children: ({
            type: NodeType.Input;
            name: string;
            value?: string | undefined;
            error?: string | undefined;
            label?: string | undefined;
            inputType?: "number" | "text" | "password" | undefined;
            placeholder?: string | undefined;
        } | {
            value: string;
            type: NodeType.Button;
            name?: string | undefined;
            variant?: "primary" | "secondary" | undefined;
            buttonType?: "button" | "submit" | undefined;
        })[];
    }, null>>;
    type: Struct<string, null>;
}>;
/**
 * A node which supports child nodes. This is used for nodes that render their
 * children, such as {@link Panel}.
 *
 * @property type - The type of the node.
 * @property children - The children of the node
 * @internal
 */
export declare type Parent = Infer<typeof ParentStruct>;
/**
 * @internal
 */
export declare const PanelStruct: Struct<Panel>;
/**
 * A panel node, which renders its children.
 *
 * @property type - The type of the node, must be the string 'text'.
 * @property value - The text content of the node, either as plain text, or as a
 * markdown string.
 */
export declare type Panel = {
    type: NodeType.Panel;
    children: Component[];
};
/**
 * Create a {@link Panel} node.
 *
 * @param args - The node arguments. This can be either an array of children, or
 * an object with a `children` property.
 * @param args.children - The child nodes of the panel. This can be any valid
 * {@link Component}.
 * @returns The panel node as object.
 * @deprecated Snaps component functions are deprecated, in favor of the new JSX
 * components. This function will be removed in a future release.
 * @example
 * const node = panel({
 *  children: [
 *    heading({ text: 'Hello, world!' }),
 *    text({ text: 'This is a panel.' }),
 *  ],
 * });
 *
 * const node = panel([
 *   heading('Hello, world!'),
 *   text('This is a panel.'),
 * ]);
 */
export declare const panel: (...args: [Omit<Panel, "type">] | ({
    value: string;
    type: NodeType.Copyable;
    sensitive?: boolean | undefined;
} | {
    type: NodeType.Divider;
} | {
    value: string;
    type: NodeType.Heading;
} | {
    value: string;
    type: NodeType.Image;
} | Panel | {
    type: NodeType.Spinner;
} | {
    value: string;
    type: NodeType.Text;
    markdown?: boolean | undefined;
} | {
    value: `0x${string}`;
    type: NodeType.Address;
} | {
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
} | {
    type: NodeType.Input;
    name: string;
    value?: string | undefined;
    error?: string | undefined;
    label?: string | undefined;
    inputType?: "number" | "text" | "password" | undefined;
    placeholder?: string | undefined;
} | {
    value: string;
    type: NodeType.Button;
    name?: string | undefined;
    variant?: "primary" | "secondary" | undefined;
    buttonType?: "button" | "submit" | undefined;
} | {
    type: NodeType.Form;
    name: string;
    children: ({
        type: NodeType.Input;
        name: string;
        value?: string | undefined;
        error?: string | undefined;
        label?: string | undefined;
        inputType?: "number" | "text" | "password" | undefined;
        placeholder?: string | undefined;
    } | {
        value: string;
        type: NodeType.Button;
        name?: string | undefined;
        variant?: "primary" | "secondary" | undefined;
        buttonType?: "button" | "submit" | undefined;
    })[];
})[][]) => Panel;
export declare const ComponentStruct: Struct<{
    value: string;
    type: NodeType.Copyable;
    sensitive?: boolean | undefined;
} | {
    type: NodeType.Divider;
} | {
    value: string;
    type: NodeType.Heading;
} | {
    value: string;
    type: NodeType.Image;
} | Panel | {
    type: NodeType.Spinner;
} | {
    value: string;
    type: NodeType.Text;
    markdown?: boolean | undefined;
} | {
    value: `0x${string}`;
    type: NodeType.Address;
} | {
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
} | {
    type: NodeType.Input;
    name: string;
    value?: string | undefined;
    error?: string | undefined;
    label?: string | undefined;
    inputType?: "number" | "text" | "password" | undefined;
    placeholder?: string | undefined;
} | {
    value: string;
    type: NodeType.Button;
    name?: string | undefined;
    variant?: "primary" | "secondary" | undefined;
    buttonType?: "button" | "submit" | undefined;
} | {
    type: NodeType.Form;
    name: string;
    children: ({
        type: NodeType.Input;
        name: string;
        value?: string | undefined;
        error?: string | undefined;
        label?: string | undefined;
        inputType?: "number" | "text" | "password" | undefined;
        placeholder?: string | undefined;
    } | {
        value: string;
        type: NodeType.Button;
        name?: string | undefined;
        variant?: "primary" | "secondary" | undefined;
        buttonType?: "button" | "submit" | undefined;
    })[];
}, null>;
/**
 * All supported component types.
 */
export declare type Component = Infer<typeof ComponentStruct>;
