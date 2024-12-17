/**
 * The parameters for calling the `scheduleNotification` JSON-RPC method.
 *
 * @property date - The ISO 8601 date of when the notification should be scheduled.
 */
export type ScheduleNotificationParams = {
  date: string;
};

/**
 * The parameters for calling the `cancelNotification` JSON-RPC method.
 *
 * @property id - The id of the notification event to cancel.
 */
export type CancelNotificationParams = {
  id: string;
};
