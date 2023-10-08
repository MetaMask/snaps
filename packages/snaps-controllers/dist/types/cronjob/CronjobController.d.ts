import type { RestrictedControllerMessenger } from '@metamask/base-controller';
import { BaseControllerV2 as BaseController } from '@metamask/base-controller';
import type { GetPermissions } from '@metamask/permission-controller';
import type { SnapId, ValidatedSnapId, CronjobSpecification } from '@metamask/snaps-utils';
import type { GetAllSnaps, HandleSnapRequest, SnapDisabled, SnapEnabled, SnapInstalled, SnapRemoved, SnapUpdated } from '..';
import { Timer } from '../snaps/Timer';
export declare type CronjobControllerActions = GetAllSnaps | HandleSnapRequest | GetPermissions;
export declare type CronjobControllerEvents = SnapInstalled | SnapRemoved | SnapUpdated | SnapEnabled | SnapDisabled;
export declare type CronjobControllerMessenger = RestrictedControllerMessenger<'CronjobController', CronjobControllerActions, CronjobControllerEvents, CronjobControllerActions['type'], CronjobControllerEvents['type']>;
export declare const DAILY_TIMEOUT: number;
export declare type CronjobControllerArgs = {
    messenger: CronjobControllerMessenger;
    /**
     * Persisted state that will be used for rehydration.
     */
    state?: CronjobControllerState;
};
export declare type Cronjob = {
    timer?: Timer;
    id: string;
    snapId: ValidatedSnapId;
} & CronjobSpecification;
export declare type StoredJobInformation = {
    lastRun: number;
};
export declare type CronjobControllerState = {
    jobs: Record<string, StoredJobInformation>;
};
declare const controllerName = "CronjobController";
/**
 * Use this controller to register and schedule periodically executed jobs
 * using RPC method hooks.
 */
export declare class CronjobController extends BaseController<typeof controllerName, CronjobControllerState, CronjobControllerMessenger> {
    #private;
    constructor({ messenger, state }: CronjobControllerArgs);
    /**
     * Retrieve all cronjob specifications for all runnable snaps.
     *
     * @returns Array of Cronjob specifications.
     */
    private getAllJobs;
    /**
     * Retrieve all Cronjob specifications for a Snap.
     *
     * @param snapId - ID of a Snap.
     * @returns Array of Cronjob specifications.
     */
    private getSnapJobs;
    /**
     * Register cron jobs for a given snap by getting specification from a permission caveats.
     * Once registered, each job will be scheduled.
     *
     * @param snapId - ID of a snap.
     */
    register(snapId: ValidatedSnapId): void;
    /**
     * Schedule a new job.
     * This will interpret the cron expression and tell the timer to execute the job
     * at the next suitable point in time.
     * Job last run state will be initialized afterwards.
     *
     * Note: Schedule will be skipped if the job's execution time is too far in the future and
     * will be revisited on a daily check.
     *
     * @param job - Cronjob specification.
     */
    private schedule;
    /**
     * Execute job.
     *
     * @param job - Cronjob specification.
     */
    private executeCronjob;
    /**
     * Unregister all jobs related to the given snapId.
     *
     * @param snapId - ID of a snap.
     */
    unregister(snapId: SnapId): void;
    /**
     * Update time of a last run for the Cronjob specified by ID.
     *
     * @param jobId - ID of a cron job.
     * @param lastRun - Unix timestamp when the job was last ran.
     */
    private updateJobLastRunState;
    /**
     * Runs every 24 hours to check if new jobs need to be scheduled.
     *
     * This is necesary for longer running jobs that execute with more than 24 hours between them.
     */
    dailyCheckIn(): Promise<void>;
    /**
     * Run controller teardown process and unsubscribe from Snap events.
     */
    destroy(): void;
    /**
     * Handle events that should cause cronjobs to be registered.
     *
     * @param snap - Basic Snap information.
     */
    private _handleSnapRegisterEvent;
    /**
     * Handle events that should cause cronjobs to be unregistered.
     *
     * @param snap - Basic Snap information.
     */
    private _handleSnapUnregisterEvent;
    /**
     * Handle cron jobs on 'snapUpdated' event.
     *
     * @param snap - Basic Snap information.
     */
    private _handleEventSnapUpdated;
}
export {};
