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
        'SubjectMetadataController:getState',
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
      });

      controller.addSubjectMetadata(getSubjectMetadata('foo.com', 'foo'));

      expect(controller.state).toStrictEqual({
        subjectMetadata: { 'foo.com': getSubjectMetadata('foo.com', 'foo') },
      });

      expect(
        (controller as any).subjectsEncounteredSinceStartup.size,
      ).toStrictEqual(1);

      controller.clearState();
      expect(controller.state).toStrictEqual({ subjectMetadata: {} });
      expect(
        (controller as any).subjectsEncounteredSinceStartup.size,
      ).toStrictEqual(0);
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
});
