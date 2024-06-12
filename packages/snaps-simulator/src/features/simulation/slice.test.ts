import type { IframeExecutionService } from '@metamask/snaps-controllers';
import type { SnapId } from '@metamask/snaps-sdk';
import { Text } from '@metamask/snaps-sdk/jsx';
import { VirtualFile } from '@metamask/snaps-utils';

import type { SnapInterface } from './slice';
import {
  SnapStatus,
  simulation as reducer,
  setExecutionService,
  setManifest,
  setSourceCode,
  setStatus,
  INITIAL_STATE,
  setAuxiliaryFiles,
  setSnapState,
  setUnencryptedSnapState,
  setLocalizationFiles,
  setSnapInterface,
  setSnapInterfaceController,
  setSnapInterfaceState,
} from './slice';
import { getSnapInterfaceController } from './test/controllers';
import { MockExecutionService } from './test/mockExecutionService';
import { MOCK_MANIFEST, MOCK_MANIFEST_FILE } from './test/mockManifest';

describe('simulation slice', () => {
  describe('setStatus', () => {
    it('sets the snap status', () => {
      const result = reducer(INITIAL_STATE, setStatus(SnapStatus.Ok));

      expect(result.status).toStrictEqual(SnapStatus.Ok);
    });
  });

  describe('setExecutionService', () => {
    it('sets execution service', () => {
      const executionService =
        new MockExecutionService() as unknown as IframeExecutionService;
      const result = reducer(
        INITIAL_STATE,
        setExecutionService(executionService),
      );

      expect(result.executionService).toStrictEqual(executionService);
    });
  });

  describe('setSnapInterfaceController', () => {
    it('sets the snap interface controller', () => {
      const snapInterfaceController = getSnapInterfaceController();

      const result = reducer(
        INITIAL_STATE,
        setSnapInterfaceController(snapInterfaceController),
      );

      expect(result.snapInterfaceController).toStrictEqual(
        snapInterfaceController,
      );
    });
  });

  describe('setSourceCode', () => {
    it('sets the source code', () => {
      const result = reducer(
        INITIAL_STATE,
        setSourceCode(new VirtualFile('foo')),
      );

      expect(result.sourceCode?.value).toBe('foo');
    });
  });

  describe('setSnapState', () => {
    it('sets snap state', () => {
      const json = JSON.stringify({ foo: 'bar' });
      const result = reducer(INITIAL_STATE, setSnapState(json));

      expect(result.snapState).toBe(json);
    });
  });

  describe('setUnencryptedSnapState', () => {
    it('sets snap state', () => {
      const json = JSON.stringify({ foo: 'bar' });
      const result = reducer(INITIAL_STATE, setUnencryptedSnapState(json));

      expect(result.unencryptedSnapState).toBe(json);
    });
  });

  describe('setAuxiliaryFiles', () => {
    it('sets the auxiliary files', () => {
      const result = reducer(
        INITIAL_STATE,
        setAuxiliaryFiles([new VirtualFile('foo')]),
      );

      expect(result.auxiliaryFiles?.[0].value).toBe('foo');
    });
  });

  describe('setLocalizationFiles', () => {
    it('sets the localization files', () => {
      const result = reducer(
        INITIAL_STATE,
        setLocalizationFiles([new VirtualFile('foo')]),
      );

      expect(result.localizationFiles?.[0].value).toBe('foo');
    });
  });

  describe('setManifest', () => {
    it('sets the manifest', () => {
      const result = reducer(INITIAL_STATE, setManifest(MOCK_MANIFEST_FILE));

      expect(result.manifest?.result).toStrictEqual(MOCK_MANIFEST);
    });
  });

  describe('setSnapInterface', () => {
    it('sets the snap interface', () => {
      const snapInterface = {
        id: 'foo',
        snapId: 'bar' as SnapId,
        content: Text({ children: 'Hello, world!' }),
        context: null,
        state: {},
      };
      const result = reducer(INITIAL_STATE, setSnapInterface(snapInterface));

      expect(result.snapInterface).toStrictEqual(snapInterface);
    });
  });

  describe('setSnapInterfaceState', () => {
    it('sets the snap interface state', () => {
      const state = { foo: 'bar' };
      const result = reducer(
        { ...INITIAL_STATE, snapInterface: { state: {} } as SnapInterface },
        setSnapInterfaceState(state),
      );

      expect(result.snapInterface?.state).toStrictEqual(state);
    });
  });
});
