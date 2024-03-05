import type { Infer } from 'superstruct';
import {
  assign,
  literal,
  object,
  optional,
  record,
  string,
  union,
} from 'superstruct';

/**
 * The type of user input event fired.
 * Currently only three events are supported:
 *
 * - `ButtonClickEvent` - A button has been clicked in the UI.
 * - `FormSubmitEvent` - A Form has been submitted in the UI.
 * - `InputChangeEvent` - The value of an input field has changed in the UI.
 */
export enum UserInputEventType {
  ButtonClickEvent = 'ButtonClickEvent',
  FormSubmitEvent = 'FormSubmitEvent',
  InputChangeEvent = 'InputChangeEvent',
}

export const GenericEventStruct = object({
  type: string(),
  name: optional(string()),
});

export const ButtonClickEventStruct = assign(
  GenericEventStruct,
  object({
    type: literal(UserInputEventType.ButtonClickEvent),
    name: optional(string()),
  }),
);

export const FormSubmitEventStruct = assign(
  GenericEventStruct,
  object({
    type: literal(UserInputEventType.FormSubmitEvent),
    value: record(string(), string()),
    name: string(),
  }),
);

export const InputChangeEventStruct = assign(
  GenericEventStruct,
  object({
    type: literal(UserInputEventType.InputChangeEvent),
    name: string(),
    value: string(),
  }),
);

export const UserInputEventStruct = union([
  ButtonClickEventStruct,
  FormSubmitEventStruct,
  InputChangeEventStruct,
]);

/**
 * A user input event fired in the UI. This is passed to the params of the `onUserInput` handler.
 *
 * @property type - The type of event fired. See {@link UserInputEventType} for the different types.
 * @property name - The component name that fired the event. It is optional for an {@link UserInputEventType.ButtonClickEvent}.
 * @property value - The value associated with the event. Only available when an {@link UserInputEventType.FormSubmitEvent} is fired.
 * It contains the form values submitted.
 */
type UserInputEvent = Infer<typeof UserInputEventStruct>;

/**
 * The `onUserInput` handler. This is called when an user input event is fired in the UI.
 *
 * @param args - The user input event.
 * @param args.id - The user interface id.
 * @param args.event - The {@link UserInputEvent} object, containing the data about the fired event.
 */
export type OnUserInputHandler = (args: {
  id: string;
  event: UserInputEvent;
}) => Promise<void>;
