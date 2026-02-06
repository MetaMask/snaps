import { createSnapComponent } from '../../component';

/**
 * The props of the {@link DateTimePicker} component.
 *
 * @property name - The name of the date/time picker field. This is used to identify the
 * date/time picker field in the form data.
 * @property value - The value of the date/time picker field. Must be an ISO 8601 date string with
 * timezone information.
 * @property type - The type of the date/time picker field. Can be 'date', 'time', or 'datetime'.
 * Defaults to 'datetime'.
 * @property placeholder - The placeholder text of the date/time picker field.
 * @property disabled - Whether the date/time picker field is disabled.
 * @property disablePast - Whether to allow selection of past dates. Defaults to false.
 * @property disableFuture - Whether to allow selection of future dates. Defaults to false.
 * @category Component Props
 */
export type DateTimePickerProps = {
  name: string;
  value?: string | undefined;
  type?: 'date' | 'time' | 'datetime' | undefined;
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
  disablePast?: boolean | undefined;
  disableFuture?: boolean | undefined;
};

const TYPE = 'DateTimePicker';

/**
 * A date/time picker component, which is used to create a date/time picker field.
 *
 * @param props - The props of the component.
 * @param props.name - The name of the date/time picker field. This is used to identify the
 * date/time picker field in the form data.
 * @param props.value - The value of the date/time picker field.
 * @param props.type - The type of the date/time picker field. Can be 'date', 'time', or 'datetime'.
 * Defaults to 'datetime'.
 * @param props.placeholder - The placeholder text of the date/time picker field.
 * @param props.disabled - Whether the date/time picker field is disabled.
 * @param props.disablePast - Whether to allow selection of past dates. Defaults to false.
 * @param props.disableFuture - Whether to allow selection of future dates. Defaults to false.
 * @category Components
 */
export const DateTimePicker = createSnapComponent<
  DateTimePickerProps,
  typeof TYPE
>(TYPE);

/**
 * A DateTimePicker element.
 *
 * @see {@link DateTimePicker}
 * @category Elements
 */
export type DateTimePickerElement = ReturnType<typeof DateTimePicker>;
