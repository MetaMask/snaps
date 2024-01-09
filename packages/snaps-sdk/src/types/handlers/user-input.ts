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

export enum UserInputEventTypes {
  ButtonClickEvent = 'ButtonClickEvent',
  FormSubmitEvent = 'FormSubmitEvent',
}

export const GenericEventStruct = object({
  type: string(),
  name: optional(string()),
});

export const ButtonClickEventStruct = assign(
  GenericEventStruct,
  object({
    type: literal(UserInputEventTypes.ButtonClickEvent),
  }),
);

export const FormSubmitEventStruct = assign(
  GenericEventStruct,
  object({
    type: literal(UserInputEventTypes.FormSubmitEvent),
    value: record(string(), string()),
    name: string(),
  }),
);

export const UserInputEventStruct = union([
  ButtonClickEventStruct,
  FormSubmitEventStruct,
]);

type UserInputEvent = Infer<typeof UserInputEventStruct>;

export type OnUserInputHandler = (args: {
  id: string;
  event: UserInputEvent;
}) => Promise<void>;
