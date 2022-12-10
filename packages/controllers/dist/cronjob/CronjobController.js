"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _CronjobController_messenger, _CronjobController_dailyTimer, _CronjobController_timers, _CronjobController_snapIds;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronjobController = exports.DAILY_TIMEOUT = void 0;
const controllers_1 = require("@metamask/controllers");
const snap_utils_1 = require("@metamask/snap-utils");
const utils_1 = require("@metamask/utils");
const __1 = require("..");
const cronjob_1 = require("../snaps/endowments/cronjob");
const Timer_1 = require("../snaps/Timer");
exports.DAILY_TIMEOUT = (0, utils_1.inMilliseconds)(24, utils_1.Duration.Hour);
const controllerName = 'CronjobController';
/**
 * Use this controller to register and schedule periodically executed jobs
 * using RPC method hooks.
 */
class CronjobController extends controllers_1.BaseControllerV2 {
    constructor({ messenger, state }) {
        super({
            messenger,
            metadata: {
                jobs: { persist: true, anonymous: false },
            },
            name: controllerName,
            state: Object.assign({ jobs: {} }, state),
        });
        _CronjobController_messenger.set(this, void 0);
        _CronjobController_dailyTimer.set(this, void 0);
        _CronjobController_timers.set(this, void 0);
        // Mapping from jobId to snapId
        _CronjobController_snapIds.set(this, void 0);
        __classPrivateFieldSet(this, _CronjobController_timers, new Map(), "f");
        __classPrivateFieldSet(this, _CronjobController_snapIds, new Map(), "f");
        __classPrivateFieldSet(this, _CronjobController_messenger, messenger, "f");
        this.dailyCheckIn();
        this._handleEventSnapInstalled = this._handleEventSnapInstalled.bind(this);
        this._handleEventSnapRemoved = this._handleEventSnapRemoved.bind(this);
        this._handleEventSnapUpdated = this._handleEventSnapUpdated.bind(this);
        // Subscribe to Snap events
        this.messagingSystem.subscribe('SnapController:snapInstalled', this._handleEventSnapInstalled);
        this.messagingSystem.subscribe('SnapController:snapRemoved', this._handleEventSnapRemoved);
        this.messagingSystem.subscribe('SnapController:snapUpdated', this._handleEventSnapUpdated);
    }
    /**
     * Retrieve all cronjob specifications for all runnable snaps.
     *
     * @returns Array of Cronjob specifications.
     */
    async getAllJobs() {
        const snaps = await this.messagingSystem.call('SnapController:getAll');
        const filteredSnaps = (0, __1.getRunnableSnaps)(snaps);
        const jobs = await Promise.all(filteredSnaps.map((snap) => this.getSnapJobs(snap.id)));
        return (0, snap_utils_1.flatten)(jobs).filter((job) => job !== undefined);
    }
    /**
     * Retrieve all Cronjob specifications for a Snap.
     *
     * @param snapId - ID of a Snap.
     * @returns Array of Cronjob specifications.
     */
    async getSnapJobs(snapId) {
        const permissions = await __classPrivateFieldGet(this, _CronjobController_messenger, "f").call('PermissionController:getPermissions', snapId);
        const permission = permissions === null || permissions === void 0 ? void 0 : permissions[__1.SnapEndowments.Cronjob];
        const definitions = (0, cronjob_1.getCronjobCaveatJobs)(permission);
        return definitions === null || definitions === void 0 ? void 0 : definitions.map((definition, idx) => {
            return Object.assign(Object.assign({}, definition), { id: `${snapId}-${idx}`, snapId });
        });
    }
    /**
     * Register cron jobs for a given snap by getting specification from a permission caveats.
     * Once registered, each job will be scheduled.
     *
     * @param snapId - ID of a snap.
     */
    async register(snapId) {
        const jobs = await this.getSnapJobs(snapId);
        jobs === null || jobs === void 0 ? void 0 : jobs.forEach((job) => this.schedule(job));
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
    schedule(job) {
        if (__classPrivateFieldGet(this, _CronjobController_timers, "f").has(job.id)) {
            return;
        }
        const parsed = (0, snap_utils_1.parseCronExpression)(job.expression);
        const next = parsed.next();
        const now = new Date();
        const ms = next.getTime() - now.getTime();
        // Don't schedule this job yet as it is too far in the future
        if (ms > exports.DAILY_TIMEOUT) {
            return;
        }
        const timer = new Timer_1.Timer(ms);
        timer.start(() => {
            this.executeCronjob(job);
            __classPrivateFieldGet(this, _CronjobController_timers, "f").delete(job.id);
            this.schedule(job);
        });
        this.updateJobLastRunState(job.id, 0); // 0 for init, never ran actually
        __classPrivateFieldGet(this, _CronjobController_timers, "f").set(job.id, timer);
        __classPrivateFieldGet(this, _CronjobController_snapIds, "f").set(job.id, job.snapId);
    }
    /**
     * Execute job.
     *
     * @param job - Cronjob specification.
     */
    executeCronjob(job) {
        this.updateJobLastRunState(job.id, Date.now());
        __classPrivateFieldGet(this, _CronjobController_messenger, "f").call('SnapController:handleRequest', {
            snapId: job.snapId,
            origin: '',
            handler: snap_utils_1.HandlerType.OnCronjob,
            request: job.request,
        });
    }
    /**
     * Unregister all jobs related to the given snapId.
     *
     * @param snapId - ID of a snap.
     */
    unregister(snapId) {
        const jobs = [...__classPrivateFieldGet(this, _CronjobController_snapIds, "f").entries()].filter(([_, jobSnapId]) => jobSnapId === snapId);
        if (jobs.length) {
            jobs.forEach(([id]) => {
                const timer = __classPrivateFieldGet(this, _CronjobController_timers, "f").get(id);
                if (timer) {
                    timer.cancel();
                    __classPrivateFieldGet(this, _CronjobController_timers, "f").delete(id);
                    __classPrivateFieldGet(this, _CronjobController_snapIds, "f").delete(id);
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
    updateJobLastRunState(jobId, lastRun) {
        this.update((state) => {
            state.jobs[jobId] = {
                lastRun,
            };
        });
    }
    /**
     * Runs every 24 hours to check if new jobs need to be scheduled.
     *
     * This is necesary for longer running jobs that execute with more than 24 hours between them.
     */
    async dailyCheckIn() {
        const jobs = await this.getAllJobs();
        jobs.forEach((job) => {
            var _a;
            const parsed = (0, snap_utils_1.parseCronExpression)(job.expression);
            const lastRun = (_a = this.state.jobs[job.id]) === null || _a === void 0 ? void 0 : _a.lastRun;
            // If a job was supposed to run while we were shut down but wasn't we run it now
            if (lastRun !== undefined &&
                parsed.hasPrev() &&
                parsed.prev().getTime() > lastRun) {
                this.executeCronjob(job);
            }
            // Try scheduling, will fail if an existing scheduled job is found
            this.schedule(job);
        });
        __classPrivateFieldSet(this, _CronjobController_dailyTimer, new Timer_1.Timer(exports.DAILY_TIMEOUT), "f");
        __classPrivateFieldGet(this, _CronjobController_dailyTimer, "f").start(() => this.dailyCheckIn());
    }
    /**
     * Run controller teardown process and unsubscribe from Snap events.
     */
    destroy() {
        super.destroy();
        this.messagingSystem.unsubscribe('SnapController:snapInstalled', this._handleEventSnapInstalled);
        this.messagingSystem.unsubscribe('SnapController:snapRemoved', this._handleEventSnapRemoved);
        this.messagingSystem.unsubscribe('SnapController:snapUpdated', this._handleEventSnapUpdated);
        __classPrivateFieldGet(this, _CronjobController_snapIds, "f").forEach((snapId) => {
            this.unregister(snapId);
        });
    }
    /**
     * Handle cron jobs on 'snapInstalled' event.
     *
     * @param snap - Basic Snap information.
     */
    async _handleEventSnapInstalled(snap) {
        await this.register(snap.id);
    }
    /**
     * Handle cron jobs on 'snapRemoved' event.
     *
     * @param snap - Basic Snap information.
     */
    _handleEventSnapRemoved(snap) {
        this.unregister(snap.id);
    }
    /**
     * Handle cron jobs on 'snapUpdated' event.
     *
     * @param snap - Basic Snap information.
     */
    async _handleEventSnapUpdated(snap) {
        this.unregister(snap.id);
        await this.register(snap.id);
    }
}
exports.CronjobController = CronjobController;
_CronjobController_messenger = new WeakMap(), _CronjobController_dailyTimer = new WeakMap(), _CronjobController_timers = new WeakMap(), _CronjobController_snapIds = new WeakMap();
//# sourceMappingURL=CronjobController.js.map