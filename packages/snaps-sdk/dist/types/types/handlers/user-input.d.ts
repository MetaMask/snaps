import type { Infer } from 'superstruct';
/**
 * The type of user input event fired.
 * Currently only three events are supported:
 *
 * - `ButtonClickEvent` - A button has been clicked in the UI.
 * - `FormSubmitEvent` - A Form has been submitted in the UI.
 * - `InputChangeEvent` - The value of an input field has changed in the UI.
 */
export declare enum UserInputEventType {
    ButtonClickEvent = "ButtonClickEvent",
    FormSubmitEvent = "FormSubmitEvent",
    InputChangeEvent = "InputChangeEvent"
}
export declare const GenericEventStruct: import("superstruct").Struct<{
    type: string;
    name?: string | undefined;
}, {
    type: import("superstruct").Struct<string, null>;
    name: import("superstruct").Struct<string | undefined, null>;
}>;
export declare const ButtonClickEventStruct: import("superstruct").Struct<{
    type: UserInputEventType.ButtonClickEvent;
    name?: string | undefined;
}, {
    type: import("superstruct").Struct<UserInputEventType.ButtonClickEvent, UserInputEventType.ButtonClickEvent>;
    name: import("superstruct").Struct<string | undefined, null>;
}>;
export declare const FormSubmitEventStruct: import("superstruct").Struct<{
    value: Record<string, string | null>;
    type: UserInputEventType.FormSubmitEvent;
    name: string;
}, {
    type: import("superstruct").Struct<UserInputEventType.FormSubmitEvent, UserInputEventType.FormSubmitEvent>;
    value: import("superstruct").Struct<Record<string, string | null>, null>;
    name: import("superstruct").Struct<string, null>;
}>;
export declare const InputChangeEventStruct: import("superstruct").Struct<{
    value: string;
    type: UserInputEventType.InputChangeEvent;
    name: string;
}, {
    type: import("superstruct").Struct<UserInputEventType.InputChangeEvent, UserInputEventType.InputChangeEvent>;
    name: import("superstruct").Struct<string, null>;
    value: import("superstruct").Struct<string, null>;
}>;
export declare const UserInputEventStruct: import("superstruct").Struct<{
    type: UserInputEventType.ButtonClickEvent;
    name?: string | undefined;
} | {
    value: Record<string, string | null>;
    type: UserInputEventType.FormSubmitEvent;
    name: string;
} | {
    value: string;
    type: UserInputEventType.InputChangeEvent;
    name: string;
}, null>;
/**
 * A user input event fired in the UI. This is passed to the params of the `onUserInput` handler.
 *
 * @property type - The type of event fired. See {@link UserInputEventType} for the different types.
 * @property name - The component name that fired the event. It is optional for an {@link UserInputEventType.ButtonClickEvent}.
 * @property value - The value associated with the event. Only available when an {@link UserInputEventType.FormSubmitEvent} is fired.
 * It contains the form values submitted.
 */
export declare type UserInputEvent = Infer<typeof UserInputEventStruct>;
/**
 * The `onUserInput` handler. This is called when an user input event is fired in the UI.
 *
 * @param args - The user input event.
 * @param args.id - The user interface id.
 * @param args.event - The {@link UserInputEvent} object, containing the data about the fired event.
 */
export declare type OnUserInputHandler = (args: {
    id: string;
    event: UserInputEvent;
}) => Promise<void>;
