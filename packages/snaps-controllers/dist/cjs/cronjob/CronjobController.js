"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    DAILY_TIMEOUT: function() {
        return DAILY_TIMEOUT;
    },
    CronjobController: function() {
        return CronjobController;
    }
});
const _basecontroller = require("@metamask/base-controller");
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("@metamask/utils");
const _ = require("..");
const _cronjob = require("../snaps/endowments/cronjob");
const _Timer = require("../snaps/Timer");
function _check_private_redeclaration(obj, privateCollection) {
    if (privateCollection.has(obj)) {
        throw new TypeError("Cannot initialize the same private elements twice on an object");
    }
}
function _class_apply_descriptor_get(receiver, descriptor) {
    if (descriptor.get) {
        return descriptor.get.call(receiver);
    }
    return descriptor.value;
}
function _class_apply_descriptor_set(receiver, descriptor, value) {
    if (descriptor.set) {
        descriptor.set.call(receiver, value);
    } else {
        if (!descriptor.writable) {
            throw new TypeError("attempted to set read only private field");
        }
        descriptor.value = value;
    }
}
function _class_extract_field_descriptor(receiver, privateMap, action) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to " + action + " private field on non-instance");
    }
    return privateMap.get(receiver);
}
function _class_private_field_get(receiver, privateMap) {
    var descriptor = _class_extract_field_descriptor(receiver, privateMap, "get");
    return _class_apply_descriptor_get(receiver, descriptor);
}
function _class_private_field_init(obj, privateMap, value) {
    _check_private_redeclaration(obj, privateMap);
    privateMap.set(obj, value);
}
function _class_private_field_set(receiver, privateMap, value) {
    var descriptor = _class_extract_field_descriptor(receiver, privateMap, "set");
    _class_apply_descriptor_set(receiver, descriptor, value);
    return value;
}
const DAILY_TIMEOUT = (0, _utils.inMilliseconds)(24, _utils.Duration.Hour);
const controllerName = 'CronjobController';
var _messenger = /*#__PURE__*/ new WeakMap(), _dailyTimer = /*#__PURE__*/ new WeakMap(), _timers = /*#__PURE__*/ new WeakMap(), // Mapping from jobId to snapId
_snapIds = /*#__PURE__*/ new WeakMap();
class CronjobController extends _basecontroller.BaseControllerV2 {
    /**
   * Retrieve all cronjob specifications for all runnable snaps.
   *
   * @returns Array of Cronjob specifications.
   */ getAllJobs() {
        const snaps = this.messagingSystem.call('SnapController:getAll');
        const filteredSnaps = (0, _.getRunnableSnaps)(snaps);
        const jobs = filteredSnaps.map((snap)=>this.getSnapJobs(snap.id));
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        return jobs.flat().filter((job)=>job !== undefined);
    }
    /**
   * Retrieve all Cronjob specifications for a Snap.
   *
   * @param snapId - ID of a Snap.
   * @returns Array of Cronjob specifications.
   */ getSnapJobs(snapId) {
        const permissions = _class_private_field_get(this, _messenger).call('PermissionController:getPermissions', snapId);
        const permission = permissions?.[_.SnapEndowments.Cronjob];
        const definitions = (0, _cronjob.getCronjobCaveatJobs)(permission);
        return definitions?.map((definition, idx)=>{
            return {
                ...definition,
                id: `${snapId}-${idx}`,
                snapId
            };
        });
    }
    /**
   * Register cron jobs for a given snap by getting specification from a permission caveats.
   * Once registered, each job will be scheduled.
   *
   * @param snapId - ID of a snap.
   */ register(snapId) {
        const jobs = this.getSnapJobs(snapId);
        jobs?.forEach((job)=>this.schedule(job));
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
   */ schedule(job) {
        if (_class_private_field_get(this, _timers).has(job.id)) {
            return;
        }
        const parsed = (0, _snapsutils.parseCronExpression)(job.expression);
        const next = parsed.next();
        const now = new Date();
        const ms = next.getTime() - now.getTime();
        // Don't schedule this job yet as it is too far in the future
        if (ms > DAILY_TIMEOUT) {
            return;
        }
        const timer = new _Timer.Timer(ms);
        timer.start(()=>{
            this.executeCronjob(job).catch((error)=>{
                // TODO: Decide how to handle errors.
                (0, _snapsutils.logError)(error);
            });
            _class_private_field_get(this, _timers).delete(job.id);
            this.schedule(job);
        });
        if (!this.state.jobs[job.id]?.lastRun) {
            this.updateJobLastRunState(job.id, 0); // 0 for init, never ran actually
        }
        _class_private_field_get(this, _timers).set(job.id, timer);
        _class_private_field_get(this, _snapIds).set(job.id, job.snapId);
    }
    /**
   * Execute job.
   *
   * @param job - Cronjob specification.
   */ async executeCronjob(job) {
        this.updateJobLastRunState(job.id, Date.now());
        await _class_private_field_get(this, _messenger).call('SnapController:handleRequest', {
            snapId: job.snapId,
            origin: '',
            handler: _snapsutils.HandlerType.OnCronjob,
            request: job.request
        });
    }
    /**
   * Unregister all jobs related to the given snapId.
   *
   * @param snapId - ID of a snap.
   */ unregister(snapId) {
        const jobs = [
            ..._class_private_field_get(this, _snapIds).entries()
        ].filter(([_, jobSnapId])=>jobSnapId === snapId);
        if (jobs.length) {
            jobs.forEach(([id])=>{
                const timer = _class_private_field_get(this, _timers).get(id);
                if (timer) {
                    timer.cancel();
                    _class_private_field_get(this, _timers).delete(id);
                    _class_private_field_get(this, _snapIds).delete(id);
                }
            });
        }
    }
    /**
   * Update time of a last run for the Cronjob specified by ID.
   *
   * @param jobId - ID of a cron job.
   * @param lastRun - Unix timestamp when the job was last ran.
   */ updateJobLastRunState(jobId, lastRun) {
        this.update((state)=>{
            state.jobs[jobId] = {
                lastRun
            };
        });
    }
    /**
   * Runs every 24 hours to check if new jobs need to be scheduled.
   *
   * This is necesary for longer running jobs that execute with more than 24 hours between them.
   */ async dailyCheckIn() {
        const jobs = this.getAllJobs();
        for (const job of jobs){
            const parsed = (0, _snapsutils.parseCronExpression)(job.expression);
            const lastRun = this.state.jobs[job.id]?.lastRun;
            // If a job was supposed to run while we were shut down but wasn't we run it now
            if (lastRun !== undefined && parsed.hasPrev() && parsed.prev().getTime() > lastRun) {
                await this.executeCronjob(job);
            }
            // Try scheduling, will fail if an existing scheduled job is found
            this.schedule(job);
        }
        _class_private_field_set(this, _dailyTimer, new _Timer.Timer(DAILY_TIMEOUT));
        _class_private_field_get(this, _dailyTimer).start(()=>{
            this.dailyCheckIn().catch((error)=>{
                // TODO: Decide how to handle errors.
                (0, _snapsutils.logError)(error);
            });
        });
    }
    /**
   * Run controller teardown process and unsubscribe from Snap events.
   */ destroy() {
        super.destroy();
        /* eslint-disable @typescript-eslint/unbound-method */ this.messagingSystem.unsubscribe('SnapController:snapInstalled', this._handleSnapRegisterEvent);
        this.messagingSystem.unsubscribe('SnapController:snapRemoved', this._handleSnapUnregisterEvent);
        this.messagingSystem.unsubscribe('SnapController:snapEnabled', this._handleSnapRegisterEvent);
        this.messagingSystem.unsubscribe('SnapController:snapDisabled', this._handleSnapUnregisterEvent);
        this.messagingSystem.unsubscribe('SnapController:snapUpdated', this._handleEventSnapUpdated);
        /* eslint-enable @typescript-eslint/unbound-method */ _class_private_field_get(this, _snapIds).forEach((snapId)=>{
            this.unregister(snapId);
        });
    }
    /**
   * Handle events that should cause cronjobs to be registered.
   *
   * @param snap - Basic Snap information.
   */ _handleSnapRegisterEvent(snap) {
        this.register(snap.id);
    }
    /**
   * Handle events that should cause cronjobs to be unregistered.
   *
   * @param snap - Basic Snap information.
   */ _handleSnapUnregisterEvent(snap) {
        this.unregister(snap.id);
    }
    /**
   * Handle cron jobs on 'snapUpdated' event.
   *
   * @param snap - Basic Snap information.
   */ _handleEventSnapUpdated(snap) {
        this.unregister(snap.id);
        this.register(snap.id);
    }
    constructor({ messenger, state }){
        super({
            messenger,
            metadata: {
                jobs: {
                    persist: true,
                    anonymous: false
                }
            },
            name: controllerName,
            state: {
                jobs: {},
                ...state
            }
        });
        _class_private_field_init(this, _messenger, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _dailyTimer, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _timers, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _snapIds, {
            writable: true,
            value: void 0
        });
        _class_private_field_set(this, _timers, new Map());
        _class_private_field_set(this, _snapIds, new Map());
        _class_private_field_set(this, _messenger, messenger);
        this._handleSnapRegisterEvent = this._handleSnapRegisterEvent.bind(this);
        this._handleSnapUnregisterEvent = this._handleSnapUnregisterEvent.bind(this);
        this._handleEventSnapUpdated = this._handleEventSnapUpdated.bind(this);
        // Subscribe to Snap events
        /* eslint-disable @typescript-eslint/unbound-method */ this.messagingSystem.subscribe('SnapController:snapInstalled', this._handleSnapRegisterEvent);
        this.messagingSystem.subscribe('SnapController:snapRemoved', this._handleSnapUnregisterEvent);
        this.messagingSystem.subscribe('SnapController:snapEnabled', this._handleSnapRegisterEvent);
        this.messagingSystem.subscribe('SnapController:snapDisabled', this._handleSnapUnregisterEvent);
        this.messagingSystem.subscribe('SnapController:snapUpdated', this._handleEventSnapUpdated);
        /* eslint-enable @typescript-eslint/unbound-method */ this.dailyCheckIn().catch((error)=>{
            (0, _snapsutils.logError)(error);
        });
    }
}

//# sourceMappingURL=CronjobController.js.map