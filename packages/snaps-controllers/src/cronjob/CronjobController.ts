import type {
  RestrictedControllerMessenger,
  ControllerGetStateAction,
  ControllerStateChangeEvent,
} from '@metamask/base-controller';
import { BaseController } from '@metamask/base-controller';
import type { GetPermissions } from '@metamask/permission-controller';
import {
  getCronjobCaveatJobs,
  SnapEndowments,
} from '@metamask/snaps-rpc-methods';
import type { BackgroundEvent, SnapId } from '@metamask/snaps-sdk';
import type {
  TruncatedSnap,
  CronjobSpecification,
} from '@metamask/snaps-utils';
import {
  HandlerType,
  parseCronExpression,
  logError,
} from '@metamask/snaps-utils';
import { assert, Duration, hasProperty, inMilliseconds } from '@metamask/utils';
import { castDraft } from 'immer';
import { nanoid } from 'nanoid';

import type {
  GetAllSnaps,
  HandleSnapRequest,
  SnapDisabled,
  SnapEnabled,
  SnapInstalled,
  SnapUninstalled,
  SnapUpdated,
} from '..';
import { getRunnableSnaps } from '..';
import { Timer } from '../snaps/Timer';

export type CronjobControllerGetStateAction = ControllerGetStateAction<
  typeof controllerName,
  CronjobControllerState
>;
export type CronjobControllerStateChangeEvent = ControllerStateChangeEvent<
  typeof controllerName,
  CronjobControllerState
>;

export type ScheduleBackgroundEvent = {
  type: `${typeof controllerName}:scheduleBackgroundEvent`;
  handler: CronjobController['scheduleBackgroundEvent'];
};

export type CancelBackgroundEvent = {
  type: `${typeof controllerName}:cancelBackgroundEvent`;
  handler: CronjobController['cancelBackgroundEvent'];
};

export type GetBackgroundEvents = {
  type: `${typeof controllerName}:getBackgroundEvents`;
  handler: CronjobController['getBackgroundEvents'];
};

export type CronjobControllerActions =
  | GetAllSnaps
  | HandleSnapRequest
  | GetPermissions
  | CronjobControllerGetStateAction
  | ScheduleBackgroundEvent
  | CancelBackgroundEvent
  | GetBackgroundEvents;

export type CronjobControllerEvents =
  | SnapInstalled
  | SnapUninstalled
  | SnapUpdated
  | SnapEnabled
  | SnapDisabled
  | CronjobControllerStateChangeEvent;

export type CronjobControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  CronjobControllerActions,
  CronjobControllerEvents,
  CronjobControllerActions['type'],
  CronjobControllerEvents['type']
>;

export const DAILY_TIMEOUT = inMilliseconds(24, Duration.Hour);

export type CronjobControllerArgs = {
  messenger: CronjobControllerMessenger;
  /**
   * Persisted state that will be used for rehydration.
   */
  state?: CronjobControllerState;
};

export type Cronjob = {
  timer?: Timer;
  id: string;
  snapId: SnapId;
} & CronjobSpecification;

export type StoredJobInformation = {
  lastRun: number;
};

export type CronjobControllerState = {
  jobs: Record<string, StoredJobInformation>;
  events: Record<string, BackgroundEvent>;
};

const subscriptionMap = new WeakMap();

const controllerName = 'CronjobController';

/**
 * Use this controller to register and schedule periodically executed jobs
 * using RPC method hooks.
 */
export class CronjobController extends BaseController<
  typeof controllerName,
  CronjobControllerState,
  CronjobControllerMessenger
> {
  #messenger: CronjobControllerMessenger;

  #dailyTimer!: Timer;

  #timers: Map<string, Timer>;

  // Mapping from jobId to snapId
  #snapIds: Map<string, string>;

  constructor({ messenger, state }: CronjobControllerArgs) {
    super({
      messenger,
      metadata: {
        jobs: { persist: true, anonymous: false },
        events: { persist: true, anonymous: false },
      },
      name: controllerName,
      state: {
        jobs: {},
        events: {},
        ...state,
      },
    });
    this.#timers = new Map();
    this.#snapIds = new Map();
    this.#messenger = messenger;

    this._handleSnapRegisterEvent = this._handleSnapRegisterEvent.bind(this);
    this._handleSnapUnregisterEvent =
      this._handleSnapUnregisterEvent.bind(this);
    this._handleEventSnapUpdated = this._handleEventSnapUpdated.bind(this);

    // Subscribe to Snap events
    /* eslint-disable @typescript-eslint/unbound-method */

    subscriptionMap.set(this, new Map());

    const map = subscriptionMap.get(this);

    map.set(
      'SnapController:snapInstalled',
      this._handleSnapRegisterEvent.bind(this),
    );
    map.set(
      'SnapController:snapEnabled',
      this._handleSnapEnabledEvent.bind(this),
    );
    map.set(
      'SnapController:snapUninstalled',
      this._handleSnapUnregisterEvent.bind(this),
    );
    map.set(
      'SnapController:snapDisabled',
      this._handleSnapDisabledEvent.bind(this),
    );
    map.set(
      'SnapController:snapUpdated',
      this._handleEventSnapUpdated.bind(this),
    );

    this.messagingSystem.subscribe(
      'SnapController:snapInstalled',
      map.get('SnapController:snapInstalled'),
    );

    this.messagingSystem.subscribe(
      'SnapController:snapUninstalled',
      map.get('SnapController:snapUninstalled'),
    );

    this.messagingSystem.subscribe(
      'SnapController:snapEnabled',
      map.get('SnapController:snapEnabled'),
    );

    this.messagingSystem.subscribe(
      'SnapController:snapDisabled',
      map.get('SnapController:snapDisabled'),
    );

    this.messagingSystem.subscribe(
      'SnapController:snapUpdated',
      map.get('SnapController:snapUpdated'),
    );
    /* eslint-enable @typescript-eslint/unbound-method */

    this.messagingSystem.registerActionHandler(
      `${controllerName}:scheduleBackgroundEvent`,
      (...args) => this.scheduleBackgroundEvent(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:cancelBackgroundEvent`,
      (...args) => this.cancelBackgroundEvent(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:getBackgroundEvents`,
      (...args) => this.getBackgroundEvents(...args),
    );

    this.dailyCheckIn().catch((error) => {
      logError(error);
    });

    this.rescheduleBackgroundEvents(Object.values(this.state.events)).catch(
      (error) => {
        logError(error);
      },
    );
  }

  /**
   * Retrieve all cronjob specifications for all runnable snaps.
   *
   * @returns Array of Cronjob specifications.
   */
  private getAllJobs(): Cronjob[] {
    const snaps = this.messagingSystem.call('SnapController:getAll');
    const filteredSnaps = getRunnableSnaps(snaps);

    const jobs = filteredSnaps.map((snap) => this.getSnapJobs(snap.id));
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return jobs.flat().filter((job) => job !== undefined) as Cronjob[];
  }

  /**
   * Retrieve all Cronjob specifications for a Snap.
   *
   * @param snapId - ID of a Snap.
   * @returns Array of Cronjob specifications.
   */
  private getSnapJobs(snapId: SnapId): Cronjob[] | undefined {
    const permissions = this.#messenger.call(
      'PermissionController:getPermissions',
      snapId,
    );

    const permission = permissions?.[SnapEndowments.Cronjob];
    const definitions = getCronjobCaveatJobs(permission);

    return definitions?.map((definition, idx) => {
      return { ...definition, id: `${snapId}-${idx}`, snapId };
    });
  }

  /**
   * Register cron jobs for a given snap by getting specification from a permission caveats.
   * Once registered, each job will be scheduled.
   *
   * @param snapId - ID of a snap.
   */
  register(snapId: SnapId) {
    const jobs = this.getSnapJobs(snapId);
    jobs?.forEach((job) => this.schedule(job));
  }

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
  private schedule(job: Cronjob) {
    if (this.#timers.has(job.id)) {
      return;
    }

    const parsed = parseCronExpression(job.expression);
    const next = parsed.next();
    const now = new Date();
    const ms = next.getTime() - now.getTime();

    // Don't schedule this job yet as it is too far in the future
    if (ms > DAILY_TIMEOUT) {
      return;
    }

    const timer = new Timer(ms);
    timer.start(() => {
      this.executeCronjob(job).catch((error) => {
        // TODO: Decide how to handle errors.
        logError(error);
      });

      this.#timers.delete(job.id);
      this.schedule(job);
    });

    if (!this.state.jobs[job.id]?.lastRun) {
      this.updateJobLastRunState(job.id, 0); // 0 for init, never ran actually
    }

    this.#timers.set(job.id, timer);
    this.#snapIds.set(job.id, job.snapId);
  }

  /**
   * Execute job.
   *
   * @param job - Cronjob specification.
   */
  private async executeCronjob(job: Cronjob) {
    this.updateJobLastRunState(job.id, Date.now());
    await this.#messenger.call('SnapController:handleRequest', {
      snapId: job.snapId,
      origin: '',
      handler: HandlerType.OnCronjob,
      request: job.request,
    });
  }

  /**
   * Schedule a background event.
   *
   * @param backgroundEventWithoutId - Background event.
   * @returns An id representing the background event.
   */
  scheduleBackgroundEvent(
    backgroundEventWithoutId: Omit<BackgroundEvent, 'id' | 'scheduledAt'>,
  ) {
    const event = this.getBackgroundEventWithId(backgroundEventWithoutId);
    event.scheduledAt = new Date().toISOString();
    this.setUpBackgroundEvent(event);
    this.update((state) => {
      state.events[event.id] = castDraft(event);
    });

    return event.id;
  }

  /**
   * Cancel a background event.
   *
   * @param id - The id of the background event to cancel.
   * @throws If the event does not exist.
   */
  cancelBackgroundEvent(id: string) {
    assert(
      this.state.events[id],
      `A background event with the id of "${id}" does not exist.`,
    );

    const timer = this.#timers.get(id);
    timer?.cancel();
    this.#timers.delete(id);
    this.#snapIds.delete(id);
    this.update((state) => {
      delete state.events[id];
    });
  }

  /**
   * Assign an id to a background event.
   *
   * @param backgroundEventWithoutId - A background event with an unassigned id.
   * @returns A background event with an id.
   */
  private getBackgroundEventWithId(
    backgroundEventWithoutId: Omit<BackgroundEvent, 'id' | 'scheduledAt'>,
  ): BackgroundEvent {
    assert(
      !hasProperty(backgroundEventWithoutId, 'id'),
      `Background event already has an id: ${
        (backgroundEventWithoutId as BackgroundEvent).id
      }`,
    );
    const event = backgroundEventWithoutId as BackgroundEvent;
    const id = this.generateBackgroundEventId();
    event.id = id;
    return event;
  }

  /**
   * A helper function to handle setup of the background event.
   *
   * @param event - A background event.
   */
  private setUpBackgroundEvent(event: BackgroundEvent) {
    const date = new Date(event.date);
    const now = new Date();
    const ms = date.getTime() - now.getTime();

    const timer = new Timer(ms);
    timer.start(() => {
      this.executeBackgroundEvent(event).catch((error) => {
        logError(error);
      });

      this.#timers.delete(event.id);
      this.#snapIds.delete(event.id);
      this.update((state) => {
        delete state.events[event.id];
      });
    });

    this.#timers.set(event.id, timer);
    this.#snapIds.set(event.id, event.snapId);
  }

  /**
   * Fire the background event.
   *
   * @param event - A background event.
   */
  private async executeBackgroundEvent(event: BackgroundEvent) {
    await this.#messenger.call('SnapController:handleRequest', {
      snapId: event.snapId,
      origin: '',
      handler: HandlerType.OnCronjob,
      request: event.request,
    });
  }

  /**
   * Get a list of a Snap's background events.
   *
   * @param snapId - The id of the Snap to fetch background events for.
   * @returns An array of background events.
   */
  getBackgroundEvents(snapId: string): BackgroundEvent[] {
    return Object.values(this.state.events).filter(
      (snapEvent) => snapEvent.snapId === snapId,
    );
  }

  /**
   * Unregister all jobs and background events related to the given snapId.
   *
   * @param snapId - ID of a snap.
   * @param skipEvents - Whether the unregistration process should skip scheduled background events.
   */
  unregister(snapId: string, skipEvents = false) {
    const jobs = [...this.#snapIds.entries()].filter(
      ([_, jobSnapId]) => jobSnapId === snapId,
    );

    if (jobs.length) {
      jobs.forEach(([id]) => {
        const timer = this.#timers.get(id);
        if (timer) {
          timer.cancel();
          this.#timers.delete(id);
          this.#snapIds.delete(id);
          if (!skipEvents && this.state.events[id]) {
            this.update((state) => {
              delete state.events[id];
            });
          }
        }
      });
    }
  }

  /**
   * Update time of a last run for the Cronjob specified by ID.
   *
   * @param jobId - ID of a cron job.
   * @param lastRun - Unix timestamp when the job was last ran.
   */
  private updateJobLastRunState(jobId: string, lastRun: number) {
    this.update((state) => {
      state.jobs[jobId] = {
        lastRun,
      };
    });
  }

  /**
   * Generate a unique id for a background event.
   *
   * @returns An id.
   */
  private generateBackgroundEventId(): string {
    const id = nanoid();
    if (this.state.events[id]) {
      this.generateBackgroundEventId();
    }
    return id;
  }

  /**
   * Runs every 24 hours to check if new jobs need to be scheduled.
   *
   * This is necessary for longer running jobs that execute with more than 24 hours between them.
   */
  async dailyCheckIn() {
    const jobs = this.getAllJobs();

    for (const job of jobs) {
      const parsed = parseCronExpression(job.expression);
      const lastRun = this.state.jobs[job.id]?.lastRun;
      // If a job was supposed to run while we were shut down but wasn't we run it now
      if (
        lastRun !== undefined &&
        parsed.hasPrev() &&
        parsed.prev().getTime() > lastRun
      ) {
        await this.executeCronjob(job);
      }

      // Try scheduling, will fail if an existing scheduled job is found
      this.schedule(job);
    }

    this.#dailyTimer = new Timer(DAILY_TIMEOUT);
    this.#dailyTimer.start(() => {
      this.dailyCheckIn().catch((error) => {
        // TODO: Decide how to handle errors.
        logError(error);
      });
    });
  }

  /**
   * Reschedule background events.
   *
   * @param backgroundEvents - A list of background events to reschdule.
   */
  private async rescheduleBackgroundEvents(
    backgroundEvents: BackgroundEvent[],
  ) {
    for (const snapEvent of backgroundEvents) {
      const { date } = snapEvent;
      const now = new Date();
      const then = new Date(date);
      if (then.getTime() < now.getTime()) {
        // removing expired events from state
        this.update((state) => {
          delete state.events[snapEvent.id];
        });

        const error = new Error(
          `Background event with id "${snapEvent.id}" not scheduled as its date has expired.`,
        );
        logError(error);
      } else {
        this.setUpBackgroundEvent(snapEvent);
      }
    }
  }

  /**
   * Run controller teardown process and unsubscribe from Snap events.
   */
  destroy() {
    super.destroy();

    const subscriptions = subscriptionMap.get(this);

    /* eslint-disable @typescript-eslint/unbound-method */
    this.messagingSystem.unsubscribe(
      'SnapController:snapInstalled',
      subscriptions.get('SnapController:snapInstalled'),
    );

    this.messagingSystem.unsubscribe(
      'SnapController:snapUninstalled',
      subscriptions.get('SnapController:snapUninstalled'),
    );

    this.messagingSystem.unsubscribe(
      'SnapController:snapEnabled',
      subscriptions.get('SnapController:snapEnabled'),
    );

    this.messagingSystem.unsubscribe(
      'SnapController:snapDisabled',
      subscriptions.get('SnapController:snapDisabled'),
    );

    this.messagingSystem.unsubscribe(
      'SnapController:snapUpdated',
      subscriptions.get('SnapController:snapUpdated'),
    );
    /* eslint-enable @typescript-eslint/unbound-method */

    this.#snapIds.forEach((snapId) => this.unregister(snapId));
  }

  /**
   * Handle events that should cause cronjobs to be registered.
   *
   * @param snap - Basic Snap information.
   */
  private _handleSnapRegisterEvent(snap: TruncatedSnap) {
    this.register(snap.id);
  }

  /**
   * Handle events that could cause cronjobs to be registered
   * and for background events to be rescheduled.
   *
   * @param snap - Basic Snap information.
   */
  private _handleSnapEnabledEvent(snap: TruncatedSnap) {
    const events = this.getBackgroundEvents(snap.id);
    this.rescheduleBackgroundEvents(events).catch((error) => logError(error));
    this.register(snap.id);
  }

  /**
   * Handle events that should cause cronjobs and background events to be unregistered.
   *
   * @param snap - Basic Snap information.
   */
  private _handleSnapUnregisterEvent(snap: TruncatedSnap) {
    this.unregister(snap.id);
  }

  /**
   * Handle events that should cause cronjobs and background events to be unregistered.
   *
   * @param snap - Basic Snap information.
   */
  private _handleSnapDisabledEvent(snap: TruncatedSnap) {
    this.unregister(snap.id, true);
  }

  /**
   * Handle cron jobs on 'snapUpdated' event.
   *
   * @param snap - Basic Snap information.
   */
  private _handleEventSnapUpdated(snap: TruncatedSnap) {
    this.unregister(snap.id);
    this.register(snap.id);
  }
}
