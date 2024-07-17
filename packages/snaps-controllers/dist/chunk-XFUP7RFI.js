"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkYYPUPKQYjs = require('./chunk-YYPUPKQY.js');


var _chunkBOFPNIRXjs = require('./chunk-BOFPNIRX.js');




var _chunkEXN2TFDJjs = require('./chunk-EXN2TFDJ.js');

// src/cronjob/CronjobController.ts
var _basecontroller = require('@metamask/base-controller');



var _snapsrpcmethods = require('@metamask/snaps-rpc-methods');




var _snapsutils = require('@metamask/snaps-utils');
var _utils = require('@metamask/utils');
var DAILY_TIMEOUT = _utils.inMilliseconds.call(void 0, 24, _utils.Duration.Hour);
var controllerName = "CronjobController";
var _messenger, _dailyTimer, _timers, _snapIds;
var CronjobController = class extends _basecontroller.BaseController {
  constructor({ messenger, state }) {
    super({
      messenger,
      metadata: {
        jobs: { persist: true, anonymous: false }
      },
      name: controllerName,
      state: {
        jobs: {},
        ...state
      }
    });
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _messenger, void 0);
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _dailyTimer, void 0);
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _timers, void 0);
    // Mapping from jobId to snapId
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _snapIds, void 0);
    _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _timers, /* @__PURE__ */ new Map());
    _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _snapIds, /* @__PURE__ */ new Map());
    _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _messenger, messenger);
    this._handleSnapRegisterEvent = this._handleSnapRegisterEvent.bind(this);
    this._handleSnapUnregisterEvent = this._handleSnapUnregisterEvent.bind(this);
    this._handleEventSnapUpdated = this._handleEventSnapUpdated.bind(this);
    this.messagingSystem.subscribe(
      "SnapController:snapInstalled",
      this._handleSnapRegisterEvent
    );
    this.messagingSystem.subscribe(
      "SnapController:snapUninstalled",
      this._handleSnapUnregisterEvent
    );
    this.messagingSystem.subscribe(
      "SnapController:snapEnabled",
      this._handleSnapRegisterEvent
    );
    this.messagingSystem.subscribe(
      "SnapController:snapDisabled",
      this._handleSnapUnregisterEvent
    );
    this.messagingSystem.subscribe(
      "SnapController:snapUpdated",
      this._handleEventSnapUpdated
    );
    this.dailyCheckIn().catch((error) => {
      _snapsutils.logError.call(void 0, error);
    });
  }
  /**
   * Retrieve all cronjob specifications for all runnable snaps.
   *
   * @returns Array of Cronjob specifications.
   */
  getAllJobs() {
    const snaps = this.messagingSystem.call("SnapController:getAll");
    const filteredSnaps = _chunkYYPUPKQYjs.getRunnableSnaps.call(void 0, snaps);
    const jobs = filteredSnaps.map((snap) => this.getSnapJobs(snap.id));
    return jobs.flat().filter((job) => job !== void 0);
  }
  /**
   * Retrieve all Cronjob specifications for a Snap.
   *
   * @param snapId - ID of a Snap.
   * @returns Array of Cronjob specifications.
   */
  getSnapJobs(snapId) {
    const permissions = _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _messenger).call(
      "PermissionController:getPermissions",
      snapId
    );
    const permission = permissions?.[_snapsrpcmethods.SnapEndowments.Cronjob];
    const definitions = _snapsrpcmethods.getCronjobCaveatJobs.call(void 0, permission);
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
  register(snapId) {
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
  schedule(job) {
    if (_chunkEXN2TFDJjs.__privateGet.call(void 0, this, _timers).has(job.id)) {
      return;
    }
    const parsed = _snapsutils.parseCronExpression.call(void 0, job.expression);
    const next = parsed.next();
    const now = /* @__PURE__ */ new Date();
    const ms = next.getTime() - now.getTime();
    if (ms > DAILY_TIMEOUT) {
      return;
    }
    const timer = new (0, _chunkBOFPNIRXjs.Timer)(ms);
    timer.start(() => {
      this.executeCronjob(job).catch((error) => {
        _snapsutils.logError.call(void 0, error);
      });
      _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _timers).delete(job.id);
      this.schedule(job);
    });
    if (!this.state.jobs[job.id]?.lastRun) {
      this.updateJobLastRunState(job.id, 0);
    }
    _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _timers).set(job.id, timer);
    _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _snapIds).set(job.id, job.snapId);
  }
  /**
   * Execute job.
   *
   * @param job - Cronjob specification.
   */
  async executeCronjob(job) {
    this.updateJobLastRunState(job.id, Date.now());
    await _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _messenger).call("SnapController:handleRequest", {
      snapId: job.snapId,
      origin: "",
      handler: _snapsutils.HandlerType.OnCronjob,
      request: job.request
    });
  }
  /**
   * Unregister all jobs related to the given snapId.
   *
   * @param snapId - ID of a snap.
   */
  unregister(snapId) {
    const jobs = [..._chunkEXN2TFDJjs.__privateGet.call(void 0, this, _snapIds).entries()].filter(
      ([_, jobSnapId]) => jobSnapId === snapId
    );
    if (jobs.length) {
      jobs.forEach(([id]) => {
        const timer = _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _timers).get(id);
        if (timer) {
          timer.cancel();
          _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _timers).delete(id);
          _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _snapIds).delete(id);
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
        lastRun
      };
    });
  }
  /**
   * Runs every 24 hours to check if new jobs need to be scheduled.
   *
   * This is necessary for longer running jobs that execute with more than 24 hours between them.
   */
  async dailyCheckIn() {
    const jobs = this.getAllJobs();
    for (const job of jobs) {
      const parsed = _snapsutils.parseCronExpression.call(void 0, job.expression);
      const lastRun = this.state.jobs[job.id]?.lastRun;
      if (lastRun !== void 0 && parsed.hasPrev() && parsed.prev().getTime() > lastRun) {
        await this.executeCronjob(job);
      }
      this.schedule(job);
    }
    _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _dailyTimer, new (0, _chunkBOFPNIRXjs.Timer)(DAILY_TIMEOUT));
    _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _dailyTimer).start(() => {
      this.dailyCheckIn().catch((error) => {
        _snapsutils.logError.call(void 0, error);
      });
    });
  }
  /**
   * Run controller teardown process and unsubscribe from Snap events.
   */
  destroy() {
    super.destroy();
    this.messagingSystem.unsubscribe(
      "SnapController:snapInstalled",
      this._handleSnapRegisterEvent
    );
    this.messagingSystem.unsubscribe(
      "SnapController:snapUninstalled",
      this._handleSnapUnregisterEvent
    );
    this.messagingSystem.unsubscribe(
      "SnapController:snapEnabled",
      this._handleSnapRegisterEvent
    );
    this.messagingSystem.unsubscribe(
      "SnapController:snapDisabled",
      this._handleSnapUnregisterEvent
    );
    this.messagingSystem.unsubscribe(
      "SnapController:snapUpdated",
      this._handleEventSnapUpdated
    );
    _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _snapIds).forEach((snapId) => {
      this.unregister(snapId);
    });
  }
  /**
   * Handle events that should cause cronjobs to be registered.
   *
   * @param snap - Basic Snap information.
   */
  _handleSnapRegisterEvent(snap) {
    this.register(snap.id);
  }
  /**
   * Handle events that should cause cronjobs to be unregistered.
   *
   * @param snap - Basic Snap information.
   */
  _handleSnapUnregisterEvent(snap) {
    this.unregister(snap.id);
  }
  /**
   * Handle cron jobs on 'snapUpdated' event.
   *
   * @param snap - Basic Snap information.
   */
  _handleEventSnapUpdated(snap) {
    this.unregister(snap.id);
    this.register(snap.id);
  }
};
_messenger = new WeakMap();
_dailyTimer = new WeakMap();
_timers = new WeakMap();
_snapIds = new WeakMap();




exports.DAILY_TIMEOUT = DAILY_TIMEOUT; exports.CronjobController = CronjobController;
//# sourceMappingURL=chunk-XFUP7RFI.js.map