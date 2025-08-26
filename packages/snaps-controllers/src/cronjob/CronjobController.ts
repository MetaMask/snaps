import type { Messenger } from '@metamask/messenger';
import type {
  ControllerGetStateAction,
  ControllerStateChangeEvent,
} from '@metamask/base-controller/next';
import { BaseController } from '@metamask/base-controller/next';
import type { GetPermissions } from '@metamask/permission-controller';
import {
  getCronjobCaveatJobs,
  SnapEndowments,
} from '@metamask/snaps-rpc-methods';
import type { BackgroundEvent, SnapId } from '@metamask/snaps-sdk';
import type { TruncatedSnap } from '@metamask/snaps-utils';
import {
  toCensoredISO8601String,
  HandlerType,
  logError,
} from '@metamask/snaps-utils';
import { assert, Duration, inMilliseconds } from '@metamask/utils';
import { castDraft } from 'immer';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';

import { getCronjobSpecificationSchedule, getExecutionDate } from './utils';
import type {
  HandleSnapRequest,
  SnapDisabled,
  SnapEnabled,
  SnapInstalled,
  SnapUninstalled,
  SnapUpdated,
} from '..';
import { METAMASK_ORIGIN } from '../snaps/constants';
import { Timer } from '../snaps/Timer';

export type CronjobControllerGetStateAction = ControllerGetStateAction<
  typeof controllerName,
  CronjobControllerState
>;
export type CronjobControllerStateChangeEvent = ControllerStateChangeEvent<
  typeof controllerName,
  CronjobControllerState
>;

/**
 * Initialise the CronjobController. This should be called after all controllers
 * are created.
 */
export type CronjobControllerInitAction = {
  type: `${typeof controllerName}:init`;
  handler: CronjobController['init'];
};

export type Schedule = {
  type: `${typeof controllerName}:schedule`;
  handler: CronjobController['schedule'];
};

export type Cancel = {
  type: `${typeof controllerName}:cancel`;
  handler: CronjobController['cancel'];
};

export type Get = {
  type: `${typeof controllerName}:get`;
  handler: CronjobController['get'];
};

export type CronjobControllerActions =
  | CronjobControllerGetStateAction
  | HandleSnapRequest
  | GetPermissions
  | Schedule
  | Cancel
  | Get
  | CronjobControllerInitAction;

export type CronjobControllerEvents =
  | CronjobControllerStateChangeEvent
  | SnapInstalled
  | SnapUninstalled
  | SnapUpdated
  | SnapEnabled
  | SnapDisabled;

export type CronjobControllerMessenger = Messenger<
  typeof controllerName,
  CronjobControllerActions,
  CronjobControllerEvents
>;

export const DAILY_TIMEOUT = inMilliseconds(24, Duration.Hour);

export type CronjobControllerStateManager = {
  set(state: CronjobControllerState): void;
  getInitialState(): CronjobControllerState | undefined;
};

export type CronjobControllerArgs = {
  messenger: CronjobControllerMessenger;

  /**
   * Persisted state that will be used for rehydration.
   */
  state?: CronjobControllerState;

  /**
   * State manager for the controller.
   *
   * This is a temporary workaround to allow the controller to update the state
   * often without persisting all of the client state to disk.
   */
  stateManager: CronjobControllerStateManager;
};

/**
 * Represents a background event that is scheduled to be executed by the
 * cronjob controller.
 */
export type InternalBackgroundEvent = BackgroundEvent & {
  /**
   * Whether the event is recurring.
   */
  recurring: boolean;

  /**
   * The cron expression or ISO 8601 duration string that defines the event's
   * schedule.
   */
  schedule: string;
};

/**
 * A schedulable background event, which is a subset of the
 * {@link InternalBackgroundEvent} type, containing only the fields required to
 * schedule an event. Other fields will be populated by the cronjob controller
 * automatically.
 */
export type SchedulableBackgroundEvent = Omit<
  InternalBackgroundEvent,
  'scheduledAt' | 'date' | 'id'
> & {
  /**
   * The optional ID of the event. If not provided, a new ID will be
   * generated.
   */
  id?: string;
};

export type CronjobControllerState = {
  /**
   * Background events and cronjobs that are scheduled to be executed.
   */
  events: Record<string, InternalBackgroundEvent>;
};

const controllerName = 'CronjobController';

/**
 * The cronjob controller is responsible for managing cronjobs and background
 * events for Snaps. It allows Snaps to schedule events that will be executed
 * at a later time.
 */
export class CronjobController extends BaseController<
  typeof controllerName,
  CronjobControllerState,
  CronjobControllerMessenger
> {
  readonly #timers: Map<string, Timer>;

  readonly #stateManager: CronjobControllerStateManager;

  #dailyTimer: Timer = new Timer(DAILY_TIMEOUT);

  constructor({ messenger, state, stateManager }: CronjobControllerArgs) {
    super({
      messenger,
      metadata: {
        events: { persist: false, anonymous: false },
      },
      name: controllerName,
      state: {
        events: {},
        ...state,
        ...stateManager.getInitialState(),
      },
    });

    this.#timers = new Map();
    this.#stateManager = stateManager;

    this.messenger.subscribe(
      'SnapController:snapInstalled',
      this.#handleSnapInstalledEvent,
    );

    this.messenger.subscribe(
      'SnapController:snapUninstalled',
      this.#handleSnapUninstalledEvent,
    );

    this.messenger.subscribe(
      'SnapController:snapEnabled',
      this.#handleSnapEnabledEvent,
    );

    this.messenger.subscribe(
      'SnapController:snapDisabled',
      this.#handleSnapDisabledEvent,
    );

    this.messenger.subscribe(
      'SnapController:snapUpdated',
      this.#handleSnapUpdatedEvent,
    );

    this.messenger.registerActionHandler(
      `${controllerName}:init`,
      (...args) => this.init(...args),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:schedule`,
      (...args) => this.schedule(...args),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:cancel`,
      (...args) => this.cancel(...args),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:get`,
      (...args) => this.get(...args),
    );
  }

  /**
   * Initialize the CronjobController.
   *
   * This starts the daily timer, clears out expired events
   * and reschedules any remaining events.
   */
  init() {
    this.#start();
    this.#clear();
    this.#reschedule();
  }

  /**
   * Schedule a non-recurring background event.
   *
   * @param event - The event to schedule.
   * @returns The ID of the scheduled event.
   */
  schedule(event: Omit<SchedulableBackgroundEvent, 'recurring'>) {
    return this.#add({
      ...event,
      recurring: false,
    });
  }

  /**
   * Cancel an event.
   *
   * @param origin - The origin making the cancel call.
   * @param id - The id of the event to cancel.
   * @throws If the event does not exist.
   */
  cancel(origin: string, id: string) {
    assert(
      this.state.events[id],
      `A background event with the id of "${id}" does not exist.`,
    );

    assert(
      this.state.events[id].snapId === origin,
      'Only the origin that scheduled this event can cancel it.',
    );

    this.#cancel(id);
  }

  /**
   * Get a list of a Snap's background events.
   *
   * @param snapId - The id of the Snap to fetch background events for.
   * @returns An array of background events.
   */
  get(snapId: SnapId): InternalBackgroundEvent[] {
    return Object.values(this.state.events)
      .filter(
        (snapEvent) => snapEvent.snapId === snapId && !snapEvent.recurring,
      )
      .map((event) => ({
        ...event,
        date: toCensoredISO8601String(event.date),
        scheduledAt: toCensoredISO8601String(event.scheduledAt),
      }));
  }

  /**
   * Register cronjobs for a given Snap by getting specification from the
   * permission caveats. Once registered, each job will be scheduled.
   *
   * @param snapId - The snap ID to register jobs for.
   */
  register(snapId: SnapId) {
    const jobs = this.#getSnapCronjobs(snapId);
    jobs?.forEach((job) => this.#add(job));
  }

  /**
   * Unregister all cronjobs and background events for a given Snap.
   *
   * @param snapId - ID of a snap.
   */
  unregister(snapId: SnapId) {
    for (const [id, event] of Object.entries(this.state.events)) {
      if (event.snapId === snapId) {
        this.#cancel(id);
      }
    }
  }

  /**
   * Run controller teardown process and unsubscribe from Snap events.
   */
  destroy() {
    super.destroy();

    this.messenger.unsubscribe(
      'SnapController:snapInstalled',
      this.#handleSnapInstalledEvent,
    );

    this.messenger.unsubscribe(
      'SnapController:snapUninstalled',
      this.#handleSnapUninstalledEvent,
    );

    this.messenger.unsubscribe(
      'SnapController:snapEnabled',
      this.#handleSnapEnabledEvent,
    );

    this.messenger.unsubscribe(
      'SnapController:snapDisabled',
      this.#handleSnapDisabledEvent,
    );

    this.messenger.unsubscribe(
      'SnapController:snapUpdated',
      this.#handleSnapUpdatedEvent,
    );

    // Cancel all timers and clear the map.
    this.#timers.forEach((timer) => timer.cancel());
    this.#timers.clear();

    if (this.#dailyTimer.status === 'running') {
      this.#dailyTimer.cancel();
    }
  }

  /**
   * Start the daily timer that will reschedule events every 24 hours.
   */
  #start() {
    this.#dailyTimer = new Timer(DAILY_TIMEOUT);
    this.#dailyTimer.start(() => {
      this.#reschedule();
      this.#start();
    });
  }

  /**
   * Add a cronjob or background event to the controller state and schedule it
   * for execution.
   *
   * @param event - The event to schedule.
   * @returns The ID of the scheduled event.
   */
  #add(event: SchedulableBackgroundEvent) {
    const id = event.id ?? nanoid();
    const internalEvent: InternalBackgroundEvent = {
      ...event,
      id,
      date: getExecutionDate(event.schedule),
      scheduledAt: new Date().toISOString(),
    };

    const { nextState } = this.update((state) => {
      state.events[internalEvent.id] = castDraft(internalEvent);
    });

    this.#stateManager.set(nextState);

    this.#schedule(internalEvent);
    return id;
  }

  /**
   * Get the next execution date for a given event and start a timer for it.
   *
   * @param event - The event to schedule.
   * @param next - Whether to schedule to the next date, otherwise will
   * schedule for existing date.
   */
  #schedule(event: InternalBackgroundEvent, next = true) {
    if (!next) {
      this.#startTimer(event);
      return;
    }

    const date = getExecutionDate(event.schedule);
    const { nextState } = this.update((state) => {
      state.events[event.id].date = date;
    });

    this.#stateManager.set(nextState);

    this.#startTimer({
      ...event,
      date,
    });
  }

  /**
   * Set up and start a timer for the given event.
   *
   * @param event - The event to schedule.
   * @throws If the event is scheduled in the past.
   */
  #startTimer(event: InternalBackgroundEvent) {
    const ms =
      DateTime.fromISO(event.date, { setZone: true }).toMillis() - Date.now();

    // We don't schedule this job yet as it is too far in the future.
    if (ms > DAILY_TIMEOUT) {
      return;
    }

    // When an event is supposed to be scheduled close to the current time
    // we may end up needing to execute immediately instead.
    if (ms <= 0) {
      this.#execute(event);
      return;
    }

    const timer = new Timer(ms);
    timer.start(() => {
      this.#execute(event);
    });

    this.#timers.set(event.id, timer);
  }

  /**
   * Execute a background event. This method is called when the event's timer
   * expires.
   *
   * If the event is not recurring, it will be removed from the state after
   * execution. If it is recurring, it will be rescheduled.
   *
   * @param event - The event to execute.
   */
  #execute(event: InternalBackgroundEvent) {
    this.messenger
      .call('SnapController:handleRequest', {
        snapId: event.snapId,
        origin: METAMASK_ORIGIN,
        handler: HandlerType.OnCronjob,
        request: event.request,
      })
      .catch((error) => {
        logError(
          `An error occurred while executing an event for Snap "${event.snapId}":`,
          error,
        );
      });

    this.#timers.delete(event.id);

    // Non-recurring events are removed from the state after execution, and
    // recurring events are rescheduled.
    if (!event.recurring) {
      const { nextState } = this.update((state) => {
        delete state.events[event.id];
      });

      this.#stateManager.set(nextState);

      return;
    }

    this.#schedule(event);
  }

  /**
   * Cancel a background event by its ID. Unlike {@link cancel}, this method
   * does not check the origin of the event, so it can be used internally.
   *
   * @param id - The ID of the background event to cancel.
   */
  #cancel(id: string) {
    const timer = this.#timers.get(id);
    timer?.cancel();
    this.#timers.delete(id);

    const { nextState } = this.update((state) => {
      delete state.events[id];
    });

    this.#stateManager.set(nextState);
  }

  /**
   * Retrieve all cronjob specifications for a Snap.
   *
   * @param snapId - ID of a Snap.
   * @returns Array of cronjob specifications.
   */
  #getSnapCronjobs(snapId: SnapId): SchedulableBackgroundEvent[] {
    const permissions = this.messenger.call(
      'PermissionController:getPermissions',
      snapId,
    );

    const permission = permissions?.[SnapEndowments.Cronjob];
    const definitions = getCronjobCaveatJobs(permission);

    if (!definitions) {
      return [];
    }

    return definitions.map((definition, idx) => {
      return {
        snapId,
        id: `cronjob-${snapId}-${idx}`,
        request: definition.request,
        schedule: getCronjobSpecificationSchedule(definition),
        recurring: true,
      };
    });
  }

  /**
   * Handle events that should cause cron jobs to be registered.
   *
   * @param snap - Basic Snap information.
   */
  readonly #handleSnapInstalledEvent = (snap: TruncatedSnap) => {
    // In case of local Snaps, they may already have cronjobs that should be cleared.
    this.unregister(snap.id);
    this.register(snap.id);
  };

  /**
   * Handle the Snap enabled event. This checks if the Snap has any cronjobs or
   * background events that need to be rescheduled.
   *
   * @param snap - Basic Snap information.
   */
  readonly #handleSnapEnabledEvent = (snap: TruncatedSnap) => {
    const events = this.get(snap.id);
    this.#reschedule(events);
    this.register(snap.id);
  };

  /**
   * Handle events that should cause cronjobs and background events to be
   * unregistered.
   *
   * @param snap - Basic Snap information.
   */
  readonly #handleSnapUninstalledEvent = (snap: TruncatedSnap) => {
    this.unregister(snap.id);
  };

  /**
   * Handle events that should cause cronjobs and background events to be
   * unregistered.
   *
   * @param snap - Basic Snap information.
   */
  readonly #handleSnapDisabledEvent = (snap: TruncatedSnap) => {
    this.unregister(snap.id);
  };

  /**
   * Handle cron jobs on 'snapUpdated' event.
   *
   * @param snap - Basic Snap information.
   */
  readonly #handleSnapUpdatedEvent = (snap: TruncatedSnap) => {
    this.unregister(snap.id);
    this.register(snap.id);
  };

  /**
   * Reschedule events that are yet to be executed. This should be called on
   * controller initialization and once every 24 hours to ensure that
   * background events are scheduled correctly.
   *
   * @param events - An array of events to reschedule. Defaults to all events in
   * the controller state.
   */
  #reschedule(events = Object.values(this.state.events)) {
    const now = Date.now();

    for (const event of events) {
      if (this.#timers.has(event.id)) {
        // If the timer for this event already exists, we don't need to
        // reschedule it.
        continue;
      }

      const eventDate = DateTime.fromISO(event.date, {
        setZone: true,
      })
        .toUTC()
        .toMillis();

      // If the event is recurring and the date is in the past, execute it
      // immediately.
      if (event.recurring && eventDate <= now) {
        this.#execute(event);
        continue;
      }

      this.#schedule(event, false);
    }
  }

  /**
   * Clear non-recurring events that are past their scheduled time.
   */
  #clear() {
    const now = Date.now();

    for (const event of Object.values(this.state.events)) {
      const eventDate = DateTime.fromISO(event.date, {
        setZone: true,
      })
        .toUTC()
        .toMillis();

      if (!event.recurring && eventDate < now) {
        this.#cancel(event.id);
      }
    }
  }
}
