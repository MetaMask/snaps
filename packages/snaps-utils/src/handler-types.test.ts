import { HandlerType, TRACKABLE_HANDLER_TYPES } from './handler-types';

describe('TRACKABLE_HANDLER_TYPES', () => {
  const expectedHandlerTypes = [
    HandlerType.OnRpcRequest,
    HandlerType.OnInstall,
    HandlerType.OnUpdate,
    HandlerType.OnHomePage,
    HandlerType.OnSettingsPage,
    HandlerType.OnUserInput,
  ];

  it('should match the exact set of trackable handler types', () => {
    expect(TRACKABLE_HANDLER_TYPES).toStrictEqual(
      new Set(expectedHandlerTypes),
    );
  });
});
