/* eslint-disable no-console, import/no-unassigned-import */

import 'ses';
import { IframeExecutionService } from '../services';
import type {
  AllowedActions,
  AllowedEvents,
  SnapControllerActions,
  SnapControllerEvents,
} from '../snaps';
import { SnapController, SnapsRegistryStatus } from '../snaps';
import { MockApprovalController, createService } from '../test-utils';

// @ts-expect-error - `globalThis.process` is not optional.
delete globalThis.process;

lockdown({
  domainTaming: 'unsafe',
  errorTaming: 'unsafe',
  stackFiltering: 'verbose',
  overrideTaming: 'severe',
});

const IFRAME_URL = 'http://localhost:4567';
const BENCHMARK_RUNS = 3;

/**
 * Create a somewhat mocked SnapController and IframeExecutionService combination.
 *
 * To be used for benchmarking purposes.
 *
 * @returns An object containing a SnapController and an IframeExecutionService.
 */
function createController() {
  const { service, controllerMessenger } = createService(
    IframeExecutionService,
    {
      iframeUrl: new URL(IFRAME_URL),
    },
  );

  // Permission Controller mocks
  controllerMessenger.registerActionHandler(
    'PermissionController:hasPermissions',
    () => {
      return true;
    },
  );

  controllerMessenger.registerActionHandler(
    'PermissionController:hasPermission',
    () => {
      return true;
    },
  );

  controllerMessenger.registerActionHandler(
    'PermissionController:grantPermissions',
    () => ({}),
  );

  // Registry mocks
  controllerMessenger.registerActionHandler(
    'SnapsRegistry:get',
    async (snaps) => {
      return Promise.resolve(
        Object.keys(snaps).reduce(
          (acc, snapId) => ({
            ...acc,
            [snapId]: { status: SnapsRegistryStatus.Unverified },
          }),
          {},
        ),
      );
    },
  );

  const approvalControllerMock = new MockApprovalController();

  controllerMessenger.registerActionHandler(
    'ApprovalController:addRequest',
    async (request) => {
      return approvalControllerMock.addRequest.bind(approvalControllerMock)(
        request,
      );
    },
  );

  controllerMessenger.registerActionHandler(
    'ApprovalController:updateRequestState',
    (request) => {
      approvalControllerMock.updateRequestStateAndApprove.bind(
        approvalControllerMock,
      )(request);
    },
  );

  const snapControllerMessenger = controllerMessenger.getRestricted<
    'SnapController',
    SnapControllerActions['type'] | AllowedActions['type'],
    SnapControllerEvents['type'] | AllowedEvents['type']
  >({
    name: 'SnapController',
    allowedEvents: [
      'ExecutionService:unhandledError',
      'ExecutionService:outboundRequest',
      'ExecutionService:outboundResponse',
      'SnapController:snapAdded',
      'SnapController:snapBlocked',
      'SnapController:snapInstalled',
      'SnapController:snapUninstalled',
      'SnapController:snapUnblocked',
      'SnapController:snapUpdated',
      'SnapController:snapRemoved',
      'SnapController:stateChange',
      'SnapController:snapRolledback',
    ],
    allowedActions: [
      'ApprovalController:addRequest',
      'ApprovalController:updateRequestState',
      'ExecutionService:executeSnap',
      'ExecutionService:terminateAllSnaps',
      'ExecutionService:terminateSnap',
      'ExecutionService:handleRpcRequest',
      'PermissionController:getEndowments',
      'PermissionController:hasPermission',
      'PermissionController:hasPermissions',
      'PermissionController:getPermissions',
      'PermissionController:grantPermissions',
      'PermissionController:revokePermissions',
      'PermissionController:revokeAllPermissions',
      'PermissionController:revokePermissionForAllSubjects',
      'PermissionController:updateCaveat',
      'PermissionController:getSubjectNames',
      'PhishingController:maybeUpdateState',
      'PhishingController:testOrigin',
      'SnapController:get',
      'SnapController:handleRequest',
      'SnapController:getSnapState',
      'SnapController:has',
      'SnapController:updateSnapState',
      'SnapController:clearSnapState',
      'SnapController:updateBlockedSnaps',
      'SnapController:enable',
      'SnapController:disable',
      'SnapController:remove',
      'SnapController:getAll',
      'SnapController:getPermitted',
      'SnapController:install',
      'SnapController:incrementActiveReferences',
      'SnapController:decrementActiveReferences',
      'SnapController:getRegistryMetadata',
      'SubjectMetadataController:getSubjectMetadata',
      'SnapsRegistry:get',
      'SnapsRegistry:getMetadata',
      'SnapsRegistry:update',
      'SnapController:disconnectOrigin',
      'SnapController:revokeDynamicPermissions',
      'SnapController:getFile',
      'SnapsRegistry:resolveVersion',
    ],
  });

  const version = '1.1.0';
  const registryUrl = 'https://registry.npmjs.org/@blockchain-lab-um/masca';
  const tarballUrl = `${registryUrl}/-/masca-${version}.tgz`;
  // Local mirror of the NPM package
  const localUrl = `http://localhost:4567/benchmark/npm`;

  const fetchFunction = async (input: URL) => {
    const stringfiedUrl = input.toString();

    if (stringfiedUrl === registryUrl) {
      return new Response(
        JSON.stringify({
          versions: {
            [version]: {
              dist: {
                tarball: tarballUrl,
              },
            },
          },
        }),
      );
    } else if (stringfiedUrl === tarballUrl) {
      return fetch(localUrl);
    }

    throw new Error(`Unmocked fetch: ${input.toString()}`);
  };

  const controller = new SnapController({
    closeAllConnections: () => undefined,
    messenger: snapControllerMessenger,
    fetchFunction: fetchFunction as any,
    featureFlags: {},
  });

  return { controller, service };
}

describe('SnapController', () => {
  it('can install a snap from NPM (benchmark)', async () => {
    const runs = [];

    for (let run = 0; run < BENCHMARK_RUNS; run++) {
      const { controller, service } = createController();

      const start = performance.now();

      await controller.installSnaps('MetaMask', {
        'npm:@blockchain-lab-um/masca': {},
      });

      const runtime = performance.now() - start;

      await service.terminateAllSnaps();

      runs.push(runtime);
      console.log('Run', run, runtime, 'ms');
    }

    const low = Math.min(...runs);
    const high = Math.max(...runs);
    const sum = runs.reduce((acc, cur) => acc + cur, 0);
    const avg = sum / BENCHMARK_RUNS;

    console.log('Low:', low, 'ms');
    console.log('High:', high, 'ms');
    console.log('Avg:', avg, 'ms');
  });
});
