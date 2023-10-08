export declare type TimerStatus = 'stopped' | 'paused' | 'running' | 'finished';
export declare class Timer {
    private state;
    /**
     * If `ms` is smaller or equal to zero (including -Infinity), the callback is added to the event loop and executed async immediately
     * If `ms` is +Infinity the timer never finishes.
     *
     * @throws {@link TypeError}. If `ms` is NaN or negative.
     * @param ms - The number of milliseconds before the callback is called after started.
     */
    constructor(ms: number);
    get status(): TimerStatus;
    /**
     * Cancels the currently running timer and marks it finished.
     *
     * @throws {@link Error}. If it wasn't running or paused.
     */
    cancel(): void;
    /**
     * Pauses a currently running timer, allowing it to resume later.
     *
     * @throws {@link Error}. If it wasn't running.
     */
    pause(): void;
    /**
     * Starts the timer.
     *
     * @param callback - The function that will be called after the timer finishes.
     * @throws {@link Error}. If it was already started.
     */
    start(callback: () => void): void;
    /**
     * Resumes a currently paused timer.
     *
     * @throws {@link Error}. If it wasn't paused.
     */
    resume(): void;
    private onFinish;
}
