/**
 * The parameters for calling the `scheduleDialogWithDate` JSON-RPC method.
 *
 * @property date - The ISO 8601 date of when the dialog should be scheduled.
 */
export type ScheduleDialogParamsWithDate = {
  date: string;
};

/**
 * The parameters for calling the `scheduleDialogWithDuration` JSON-RPC method.
 *
 * @property duration - The ISO 8601 duration of when the dialog should be scheduled.
 */
export type ScheduleDialogParamsWithDuration = {
  duration: string;
};

/**
 * The parameters for calling the `cancelDialog` JSON-RPC method.
 *
 * @property id - The id of the dialog event to cancel.
 */
export type CancelDialogParams = {
  id: string;
};
