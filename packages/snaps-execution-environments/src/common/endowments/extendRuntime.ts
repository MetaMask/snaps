import type { JsonRpcNotification } from '@metamask/utils';

/**
 * Configuration for long-running timer requests.
 */
export type ExtendRuntimeConfiguration = {
  timeWait: number; // In seconds
};

/**
 * Timer actions used by endowment to control the timer.
 */
export enum TimerAction {
  Pause = 'pause',
  Resume = 'resume',
}

// TODO: Timer pause time values and range are to be discussed.
/**
 * Minimum time in seconds that can be used for extended runtime.
 */
export const MIN_RUNTIME_EXTEND = 1;

/**
 * Maximum time in seconds that can be used for extended runtime.
 */
export const MAX_RUNTIME_EXTEND = 3600;

/**
 * Creates a `extendRuntime` function which provides a mechanism for
 * a long-running synchronous work by pausing the termination timers.
 *
 * @param notify - Callback function for publishing notifications for timer actions.
 * @returns An object with the `extendRuntime` function.
 */
const extendRuntime = (
  notify: (requestObject: Omit<JsonRpcNotification, 'jsonrpc'>) => void,
) => {
  // Track execution state to prevent multiple or recursive calls
  let executionInProgress = false;
  const _extendRuntime = async (
    callback: () => unknown,
    configuration: ExtendRuntimeConfiguration,
  ): Promise<unknown> => {
    if (executionInProgress) {
      throw new Error(
        `Extend runtime endowment doesn't support multiple calls at the same time or recursive calls.`,
      );
    }
    if (typeof callback !== 'function') {
      throw new Error(
        `Extend runtime callback must be a function, but '${typeof callback}' was received instead.`,
      );
    }
    if (
      configuration.timeWait < MIN_RUNTIME_EXTEND ||
      configuration.timeWait > MAX_RUNTIME_EXTEND
    ) {
      throw new Error(
        `Extend runtime time can be only between ${MIN_RUNTIME_EXTEND} and ${MAX_RUNTIME_EXTEND} seconds. Received: ${configuration.timeWait} seconds.`,
      );
    }
    executionInProgress = true;

    // Request time
    notify({
      method: 'ExecutionTimerRequest',
      params: {
        timerAction: TimerAction.Pause,
        timeWait: configuration.timeWait,
      },
    });

    const callbackExecutionPromise = new Promise((resolve, reject) => {
      // Execute callback's synchronous work as timeout.
      // This will allow post message stream to deliver the notification
      // message first, then synchronous work inside callback can start.
      // This is needed because synchronous work is blocking operation and
      // will not allow notification to be delivered since it will start
      // before event queue is cleared for notification process and block
      // the execution environment.
      setTimeout(() => {
        try {
          const result = callback();
          executionInProgress = false;
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, 1);
    });

    try {
      const callbackExecutionResult = await callbackExecutionPromise;

      notify({
        method: 'ExecutionTimerRequest',
        params: {
          timerAction: TimerAction.Resume,
        },
      });

      return callbackExecutionResult;
    } catch (error) {
      notify({
        method: 'ExecutionTimerRequest',
        params: {
          timerAction: TimerAction.Resume,
          error: true,
          errorMessage: error.message,
        },
      });
      executionInProgress = false;

      throw error;
    }
  };

  return {
    extendRuntime: harden(_extendRuntime),
  } as const;
};

const endowmentModule = {
  names: ['extendRuntime'] as const,
  factory: extendRuntime,
};

export default endowmentModule;
