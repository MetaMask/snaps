import { ControllerMessenger, Json } from '@metamask/controllers';
import { HasPermissions } from '../permissions';
import {
  SubjectMetadataController,
  SubjectMetadataControllerActions,
  SubjectMetadataControllerEvents,
} from './SubjectMetadataController';

const controllerName = 'SubjectMetadataController';

function getSubjectMetadataControllerMessenger() {
  const controllerMessenger = new ControllerMessenger<
    SubjectMetadataControllerActions | HasPermissions,
    SubjectMetadataControllerEvents
  >();

  const hasPermissionsSpy = jest.fn();
  controllerMessenger.registerActionHandler(
    'PermissionController:hasPermissions',
    hasPermissionsSpy,
  );

  return [
    controllerMessenger.getRestricted<
      typeof controllerName,
      SubjectMetadataControllerActions['type'] | HasPermissions['type'],
      SubjectMetadataControllerEvents['type']
    >({
      name: controllerName,
      allowedActions: [
        'PermissionController:hasPermissions',
        'SubjectMetadataController:clearState',
        'SubjectMetadataController:getState',
        'SubjectMetadataController:trimMetadataState',
      ],
    }),
    hasPermissionsSpy,
  ] as const;
}

function getSubjectMetadata(
  origin: string,
  name: string,
  opts?: Record<string, Json>,
) {
  return {
    origin,
    name,
    iconUrl: null,
    host: null,
    extensionId: null,
    ...opts,
  };
}

describe('SubjectMetadataController', () => {
  describe('constructor', () => {
    it('initializes a subject metadata controller', () => {
      const controller = new SubjectMetadataController({
        messenger: getSubjectMetadataControllerMessenger()[0],
        subjectCacheLimit: 10,
      });
      expect(controller.state).toStrictEqual({ subjectMetadata: {} });
    });

    it('trims subject metadata state on startup', () => {
      const [messenger, hasPermissionsSpy] =
        getSubjectMetadataControllerMessenger();
      hasPermissionsSpy.mockImplementationOnce(() => false);
      hasPermissionsSpy.mockImplementationOnce(() => true);

      const controller = new SubjectMetadataController({
        messenger,
        subjectCacheLimit: 10,
        state: {
          subjectMetadata: {
            'foo.com': getSubjectMetadata('foo.com', 'foo'),
            'bar.io': getSubjectMetadata('bar.io', 'bar'),
          },
        },
      });

      expect(controller.state).toStrictEqual({
        subjectMetadata: { 'bar.io': getSubjectMetadata('bar.io', 'bar') },
      });
    });

    it('throws if the subject cache limit is invalid', () => {
      [0, -1, 1.1].forEach((subjectCacheLimit) => {
        expect(
          () =>
            new SubjectMetadataController({
              messenger: getSubjectMetadataControllerMessenger()[0],
              subjectCacheLimit,
            }),
        ).toThrow(
          `subjectCacheLimit must be a positive integer. Received: "${subjectCacheLimit}"`,
        );
      });
    });
  });

  describe('clearState', () => {
    it('clears the controller state', () => {
      const [messenger, hasPermissionsSpy] =
        getSubjectMetadataControllerMessenger();
      hasPermissionsSpy.mockImplementation(() => true);

      const controller = new SubjectMetadataController({
        messenger,
        subjectCacheLimit: 10,
        state: {
          subjectMetadata: {
            'foo.com': getSubjectMetadata('foo.com', 'foo'),
          },
        },
      });

      expect(controller.state).toStrictEqual({
        subjectMetadata: { 'foo.com': getSubjectMetadata('foo.com', 'foo') },
      });
      controller.clearState();
      expect(controller.state).toStrictEqual({ subjectMetadata: {} });
    });
  });

  describe('addSubjectMetadata', () => {
    it('adds subject metadata', () => {
      const controller = new SubjectMetadataController({
        messenger: getSubjectMetadataControllerMessenger()[0],
        subjectCacheLimit: 10,
      });

      controller.addSubjectMetadata(getSubjectMetadata('foo.com', 'foo'));
      expect(controller.state).toStrictEqual({
        subjectMetadata: { 'foo.com': getSubjectMetadata('foo.com', 'foo') },
      });
    });

    it('fills in missing fields of added subject metadata', () => {
      const controller = new SubjectMetadataController({
        messenger: getSubjectMetadataControllerMessenger()[0],
        subjectCacheLimit: 10,
      });

      controller.addSubjectMetadata({ origin: 'foo.com', name: 'foo' });
      expect(controller.state).toStrictEqual({
        subjectMetadata: { 'foo.com': getSubjectMetadata('foo.com', 'foo') },
      });
    });

    it('does not delete metadata for subjects with permissions if cache size is exceeded', () => {
      const [messenger, hasPermissionsSpy] =
        getSubjectMetadataControllerMessenger();
      const controller = new SubjectMetadataController({
        messenger,
        subjectCacheLimit: 1,
      });
      hasPermissionsSpy.mockImplementationOnce(() => true);

      controller.addSubjectMetadata({ origin: 'foo.com', name: 'foo' });
      controller.addSubjectMetadata({ origin: 'bar.io', name: 'bar' });
      expect(controller.state).toStrictEqual({
        subjectMetadata: {
          'foo.com': getSubjectMetadata('foo.com', 'foo'),
          'bar.io': getSubjectMetadata('bar.io', 'bar'),
        },
      });
    });

    it('deletes metadata for subjects without permissions if cache size is exceeded', () => {
      const [messenger, hasPermissionsSpy] =
        getSubjectMetadataControllerMessenger();
      const controller = new SubjectMetadataController({
        messenger,
        subjectCacheLimit: 1,
      });
      hasPermissionsSpy.mockImplementationOnce(() => false);

      controller.addSubjectMetadata({ origin: 'foo.com', name: 'foo' });
      controller.addSubjectMetadata({ origin: 'bar.io', name: 'bar' });
      expect(controller.state).toStrictEqual({
        subjectMetadata: {
          'bar.io': getSubjectMetadata('bar.io', 'bar'),
        },
      });
    });

    it('adds "host" property for valid URL origin', () => {
      const controller = new SubjectMetadataController({
        messenger: getSubjectMetadataControllerMessenger()[0],
        subjectCacheLimit: 10,
      });

      controller.addSubjectMetadata({ origin: 'https://foo.com', name: 'foo' });
      expect(controller.state).toStrictEqual({
        subjectMetadata: {
          'https://foo.com': getSubjectMetadata('https://foo.com', 'foo', {
            host: 'foo.com',
          }),
        },
      });
    });

    it('logs error if failing to compute host from URL-like origin', () => {
      const controller = new SubjectMetadataController({
        messenger: getSubjectMetadataControllerMessenger()[0],
        subjectCacheLimit: 10,
      });
      jest.spyOn(console, 'error');

      controller.addSubjectMetadata({ origin: 'https://foo@', name: 'foo' });
      expect(controller.state).toStrictEqual({
        subjectMetadata: {
          'https://foo@': getSubjectMetadata('https://foo@', 'foo'),
        },
      });
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('trimMetadataState', () => {
    it('deletes all subjects without permissions from state', () => {
      const [messenger, hasPermissionsSpy] =
        getSubjectMetadataControllerMessenger();
      const controller = new SubjectMetadataController({
        messenger,
        subjectCacheLimit: 4,
      });

      controller.addSubjectMetadata({ origin: 'A', name: 'a' });
      controller.addSubjectMetadata({ origin: 'B', name: 'b' });
      controller.addSubjectMetadata({ origin: 'C', name: 'c' });
      controller.addSubjectMetadata({ origin: 'D', name: 'd' });
      expect(controller.state).toStrictEqual({
        subjectMetadata: {
          A: getSubjectMetadata('A', 'a'),
          B: getSubjectMetadata('B', 'b'),
          C: getSubjectMetadata('C', 'c'),
          D: getSubjectMetadata('D', 'd'),
        },
      });

      hasPermissionsSpy.mockImplementationOnce(() => true);
      hasPermissionsSpy.mockImplementationOnce(() => false);
      hasPermissionsSpy.mockImplementationOnce(() => false);
      hasPermissionsSpy.mockImplementationOnce(() => true);

      controller.trimMetadataState();
      expect(controller.state).toStrictEqual({
        subjectMetadata: {
          A: getSubjectMetadata('A', 'a'),
          D: getSubjectMetadata('D', 'd'),
        },
      });
    });
  });

  describe('actions', () => {
    describe('SubjectMetadataController:clearState', () => {
      it('calls SubjectMetadataController.clearState', () => {
        const [messenger] = getSubjectMetadataControllerMessenger();

        const controller = new SubjectMetadataController({
          messenger,
          subjectCacheLimit: 10,
        });
        jest.spyOn(controller, 'clearState');

        messenger.call('SubjectMetadataController:clearState');
        expect(controller.clearState).toHaveBeenCalledTimes(1);
        expect(controller.clearState).toHaveBeenCalledWith();
      });
    });

    describe('SubjectMetadataController:trimMetadataState', () => {
      it('calls SubjectMetadataController.trimMetadataState', () => {
        const [messenger] = getSubjectMetadataControllerMessenger();

        const controller = new SubjectMetadataController({
          messenger,
          subjectCacheLimit: 10,
        });
        jest.spyOn(controller, 'trimMetadataState');

        messenger.call('SubjectMetadataController:trimMetadataState');
        expect(controller.trimMetadataState).toHaveBeenCalledTimes(1);
        expect(controller.trimMetadataState).toHaveBeenCalledWith();
      });
    });
  });
});
