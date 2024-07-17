import type { Infer } from '@metamask/superstruct';
import type { InterfaceContext } from '../interface';
/**
 * The type of user input event fired.
 * Currently only three events are supported:
 *
 * - `ButtonClickEvent` - A button has been clicked in the UI.
 * - `FormSubmitEvent` - A Form has been submitted in the UI.
 * - `InputChangeEvent` - The value of an input field has changed in the UI.
 * - `FileUploadEvent` - A file has been uploaded in the UI.
 */
export declare enum UserInputEventType {
    ButtonClickEvent = "ButtonClickEvent",
    FormSubmitEvent = "FormSubmitEvent",
    InputChangeEvent = "InputChangeEvent",
    FileUploadEvent = "FileUploadEvent"
}
export declare const GenericEventStruct: import("@metamask/superstruct").Struct<{
    type: string;
    name?: string | undefined;
}, {
    type: import("@metamask/superstruct").Struct<string, null>;
    name: import("@metamask/superstruct").Struct<string | undefined, null>;
}>;
export declare const ButtonClickEventStruct: import("@metamask/superstruct").Struct<{
    type: UserInputEventType.ButtonClickEvent;
    name?: string | undefined;
}, {
    type: import("@metamask/superstruct").Struct<UserInputEventType.ButtonClickEvent, UserInputEventType.ButtonClickEvent>;
    name: import("@metamask/superstruct").Struct<string | undefined, null>;
}>;
/**
 * A button click event fired in the UI. This is passed to the params of the
 * `onUserInput` handler.
 *
 * @property type - The type of event fired. See {@link UserInputEventType} for
 * the different types. This is always `ButtonClickEvent`.
 * @property name - The optional component name that fired the event.
 */
export declare type ButtonClickEvent = Infer<typeof ButtonClickEventStruct>;
export declare const FileStruct: import("@metamask/superstruct").Struct<{
    name: string;
    size: number;
    contentType: string;
    contents: string;
}, {
    name: import("@metamask/superstruct").Struct<string, null>;
    size: import("@metamask/superstruct").Struct<number, null>;
    contentType: import("@metamask/superstruct").Struct<string, null>;
    contents: import("@metamask/superstruct").Struct<string, null>;
}>;
/**
 * A file object containing the file name, size, content type, and the base64
 * encoded contents of the file.
 *
 * @property name - The name of the file.
 * @property size - The size of the file in bytes.
 * @property contentType - The content type of the file.
 * @property contents - The base64 encoded contents of the file.
 */
export declare type File = Infer<typeof FileStruct>;
export declare const FormSubmitEventStruct: import("@metamask/superstruct").Struct<{
    value: Record<string, string | boolean | {
        name: string;
        size: number;
        contentType: string;
        contents: string;
    } | null>;
    type: UserInputEventType.FormSubmitEvent;
    name: string;
}, {
    type: import("@metamask/superstruct").Struct<UserInputEventType.FormSubmitEvent, UserInputEventType.FormSubmitEvent>;
    value: import("@metamask/superstruct").Struct<Record<string, string | boolean | {
        name: string;
        size: number;
        contentType: string;
        contents: string;
    } | null>, null>;
    name: import("@metamask/superstruct").Struct<string, null>;
}>;
/**
 * A form submit event, which is fired when a submit button is clicked.
 *
 * @property type - The type of event fired. This is always `FormSubmitEvent`.
 * @property name - The name of the form that was submitted.
 * @property value - The form values submitted as an object. The keys are the
 * names of the form fields and the values are the values of the form fields. If
 * a form field is empty, the value is `null` or an empty string.
 * @property files - The files uploaded in the form. The keys are the names of
 * the file input fields and the values are the file objects containing the file
 * name, size, content type, and the base64 encoded contents of the file. See
 * {@link File}.
 */
export declare type FormSubmitEvent = Infer<typeof FormSubmitEventStruct>;
export declare const InputChangeEventStruct: import("@metamask/superstruct").Struct<{
    value: string | boolean;
    type: UserInputEventType.InputChangeEvent;
    name: string;
}, {
    type: import("@metamask/superstruct").Struct<UserInputEventType.InputChangeEvent, UserInputEventType.InputChangeEvent>;
    name: import("@metamask/superstruct").Struct<string, null>;
    value: import("@metamask/superstruct").Struct<string | boolean, null>;
}>;
/**
 * An input change event, which is fired when the value of an input field
 * changes.
 *
 * @property type - The type of event fired. This is always `InputChangeEvent`.
 * @property name - The name of the input field that changed.
 * @property value - The new value of the input field.
 */
export declare type InputChangeEvent = Infer<typeof InputChangeEventStruct>;
export declare const FileUploadEventStruct: import("@metamask/superstruct").Struct<{
    type: UserInputEventType.FileUploadEvent;
    name: string;
    file: {
        name: string;
        size: number;
        contentType: string;
        contents: string;
    } | null;
}, {
    type: import("@metamask/superstruct").Struct<UserInputEventType.FileUploadEvent, UserInputEventType.FileUploadEvent>;
    name: import("@metamask/superstruct").Struct<string, null>;
    file: import("@metamask/superstruct").Struct<{
        name: string;
        size: number;
        contentType: string;
        contents: string;
    } | null, {
        name: import("@metamask/superstruct").Struct<string, null>;
        size: import("@metamask/superstruct").Struct<number, null>;
        contentType: import("@metamask/superstruct").Struct<string, null>;
        contents: import("@metamask/superstruct").Struct<string, null>;
    }>;
}>;
/**
 * A file upload event, which is fired when a file is uploaded.
 *
 * @property type - The type of event fired. This is always `FileUploadEvent`.
 * @property name - The name of the file input field that was used to upload the
 * file.
 * @property file - The file object containing the file name, size,
 * content type, and the base64 encoded contents of the file.
 * @see File
 */
export declare type FileUploadEvent = Infer<typeof FileUploadEventStruct>;
export declare const UserInputEventStruct: import("@metamask/superstruct").Struct<{
    type: UserInputEventType.ButtonClickEvent;
    name?: string | undefined;
} | {
    value: Record<string, string | boolean | {
        name: string;
        size: number;
        contentType: string;
        contents: string;
    } | null>;
    type: UserInputEventType.FormSubmitEvent;
    name: string;
} | {
    value: string | boolean;
    type: UserInputEventType.InputChangeEvent;
    name: string;
} | {
    type: UserInputEventType.FileUploadEvent;
    name: string;
    file: {
        name: string;
        size: number;
        contentType: string;
        contents: string;
    } | null;
}, null>;
/**
 * A user input event fired in the UI. This is passed to the params of the `onUserInput` handler.
 *
 * @property type - The type of event fired. See {@link UserInputEventType} for the different types.
 * @property name - The component name that fired the event. It is optional for
 * an {@link UserInputEventType.ButtonClickEvent}.
 * @property value - The value associated with the event. Only available when an
 * {@link UserInputEventType.FormSubmitEvent} is fired. It contains the form values submitted.
 */
export declare type UserInputEvent = ButtonClickEvent | FormSubmitEvent | InputChangeEvent | FileUploadEvent;
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
    context: InterfaceContext | null;
}) => Promise<void>;
