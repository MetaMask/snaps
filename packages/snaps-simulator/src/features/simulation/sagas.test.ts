import type { GenericPermissionController } from '@metamask/permission-controller';
import { processSnapPermissions } from '@metamask/snaps-controllers';
import { DEFAULT_ENDOWMENTS, HandlerType } from '@metamask/snaps-utils';
import { expectSaga } from 'redux-saga-test-plan';

import { DEFAULT_SRP, setSnapId } from '../configuration';
import { initSaga, permissionsSaga, rebootSaga, requestSaga } from './sagas';
import {
  sendRequest,
  setExecutionService,
  setManifest,
  setSourceCode,
} from './slice';
import { MockExecutionService } from './test/mockExecutionService';
import { MOCK_MANIFEST, MOCK_MANIFEST_FILE } from './test/mockManifest';
import { MOCK_SNAP_SOURCE, MOCK_SNAP_SOURCE_FILE } from './test/mockSnap';

const snapId = 'local:http://localhost:8080';

describe('initSaga', () => {
  it('initializes the execution environment', async () => {
    await expectSaga(initSaga, setSnapId(snapId))
      .withState({
        configuration: { srp: DEFAULT_SRP },
      })
      .put.actionType(setExecutionService.type)
      .silentRun();
  });
});

describe('rebootSaga', () => {
  it('reboots the execution environment when source code changes', async () => {
    const executionService = new MockExecutionService();
    const permissionController = {
      hasPermission: jest.fn().mockImplementation(() => true),
      getEndowments: jest.fn().mockResolvedValue([]),
    } as unknown as GenericPermissionController;
    await expectSaga(rebootSaga, setSourceCode(MOCK_SNAP_SOURCE_FILE))
      .withState({
        configuration: { snapId },
        simulation: { executionService, permissionController },
      })
      .call([executionService, 'terminateAllSnaps'])
      .call([executionService, 'executeSnap'], {
        snapId,
        sourceCode: MOCK_SNAP_SOURCE,
        endowments: DEFAULT_ENDOWMENTS,
      })
      .silentRun();
  });
});

describe('requestSaga', () => {
  it('sends requests to the execution environment and captures the response', async () => {
    const sourceCode = 'foo';
    const executionService = new MockExecutionService();
    const request = {
      origin: 'Snaps Simulator',
      handler: HandlerType.OnRpcRequest,
      request: {
        jsonrpc: '2.0',
        method: 'bar',
      },
    };
    await expectSaga(requestSaga, sendRequest(request))
      .withState({
        configuration: { snapId },
        simulation: { sourceCode, executionService },
      })
      .put({
        type: `${HandlerType.OnRpcRequest}/setRequest`,
        payload: request,
      })
      .call([executionService, 'handleRpcRequest'], snapId, request)
      .put({
        type: `${HandlerType.OnRpcRequest}/setResponse`,
        payload: {
          result: 'foobar',
        },
      })
      .silentRun();
  });
});

describe('permissionsSaga', () => {
  it('grants permissions based on the manifest payload', async () => {
    const grantPermissions = jest.fn();
    const permissionController = {
      grantPermissions,
    } as unknown as GenericPermissionController;

    const subjectMetadataController = {
      addSubjectMetadata: jest.fn(),
    };

    const approvedPermissions = processSnapPermissions(
      MOCK_MANIFEST.initialPermissions,
    );

    await expectSaga(permissionsSaga, setManifest(MOCK_MANIFEST_FILE))
      .withState({
        configuration: { snapId },
        simulation: { subjectMetadataController, permissionController },
      })
      .call([permissionController, 'grantPermissions'], {
        approvedPermissions,
        subject: { origin: snapId },
        preserveExistingPermissions: false,
      })
      .silentRun();
  });
});
