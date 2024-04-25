import type {
  FormState,
  InterfaceState,
  SnapId,
  UserInputEvent,
} from '@metamask/snaps-sdk';
import { DialogType, UserInputEventType, assert } from '@metamask/snaps-sdk';
import type {
  ButtonElement,
  FormElement,
  InputElement,
  JSXElement,
} from '@metamask/snaps-sdk/jsx';
import { HandlerType, unwrapError, walkJsx } from '@metamask/snaps-utils';
import type { PayloadAction } from '@reduxjs/toolkit';
import { type SagaIterator } from 'redux-saga';
import { call, put, select, take } from 'redux-saga/effects';

import type { SnapInterface, SnapInterfaceActions } from '../../types';
import type { RootControllerMessenger } from './controllers';
import type { Interface, RunSagaFunction } from './store';
import { getCurrentInterface, resolveInterface, setInterface } from './store';

/**
 * Get a user interface object from a type and content object.
 *
 * @param runSaga - A function to run a saga outside the usual Redux flow.
 * @param type - The type of the interface.
 * @param content - The content to show in the interface.
 * @param interfaceActions - The actions to interact with the interface.
 * @returns The user interface object.
 */
export function getInterfaceResponse(
  runSaga: RunSagaFunction,
  type: DialogType,
  content: JSXElement,
  interfaceActions: SnapInterfaceActions,
): SnapInterface {
  switch (type) {
    case DialogType.Alert:
      return {
        ...interfaceActions,
        type,
        content,
        ok: resolveWith(runSaga, null),
      };

    case DialogType.Confirmation:
      return {
        ...interfaceActions,
        type,
        content,

        ok: resolveWith(runSaga, true),
        cancel: resolveWith(runSaga, false),
      };

    case DialogType.Prompt:
      return {
        ...interfaceActions,
        type,
        content,

        ok: resolveWithInput(runSaga),
        cancel: resolveWith(runSaga, null),
      };

    default:
      throw new Error(`Unknown or unsupported dialog type: "${String(type)}".`);
  }
}

/**
 * Resolve the current user interface with the given value. This returns a
 * function that can be used to resolve the user interface.
 *
 * @param runSaga - A function to run a saga outside the usual Redux flow.
 * @param value - The value to resolve the user interface with.
 * @returns A function that can be used to resolve the user interface.
 */
function resolveWith(runSaga: RunSagaFunction, value: unknown) {
  /**
   * Resolve the current user interface with the given value.
   *
   * @yields Puts the resolve user interface action.
   */
  function* resolveWithSaga(): SagaIterator {
    yield put(resolveInterface(value));
  }

  return async () => {
    await runSaga(resolveWithSaga).toPromise();
  };
}

/**
 * Resolve the current user interface with the provided input. This returns a
 * function that can be used to resolve the user interface.
 *
 * @param runSaga - A function to run a saga outside the usual Redux flow.
 * @returns A function that can be used to resolve the user interface.
 */
function resolveWithInput(runSaga: RunSagaFunction) {
  /**
   * Resolve the current user interface with the given value.
   *
   * @param value - The value to resolve the user interface with.
   * @yields Puts the resolve user interface action.
   */
  function* resolveWithSaga(value: string): SagaIterator {
    yield put(resolveInterface(value));
  }

  return async (value = '') => {
    await runSaga(resolveWithSaga, value).toPromise();
  };
}

/**
 * Get the stored user interface from the store.
 *
 * @param controllerMessenger - The controller messenger used to call actions.
 * @param snapId - The Snap ID.
 * @yields Takes the set interface action.
 * @returns The user interface object.
 */
function* getStoredInterface(
  controllerMessenger: RootControllerMessenger,
  snapId: SnapId,
): SagaIterator<Interface & { content: JSXElement }> {
  const currentInterface: Interface | null = yield select(getCurrentInterface);

  if (currentInterface) {
    const { content } = controllerMessenger.call(
      'SnapInterfaceController:getInterface',
      snapId,
      currentInterface.id,
    );

    return { ...currentInterface, content };
  }

  const { payload }: PayloadAction<Interface> = yield take(setInterface.type);

  const { content } = controllerMessenger.call(
    'SnapInterfaceController:getInterface',
    snapId,
    payload.id,
  );

  return { ...payload, content };
}

/**
 * Find an element inside a form element in a JSX tree.
 *
 * @param form - The form element.
 * @param name - The element name.
 * @returns An object containing the element and the form name if it's contained
 * in a form, otherwise undefined.
 */
function getFormElement(form: FormElement, name: string) {
  const element = walkJsx(form, (childElement) => {
    if (
      (childElement.type === 'Input' || childElement.type === 'Button') &&
      childElement.props.name === name
    ) {
      return childElement;
    }

    return undefined;
  });

  if (element === undefined) {
    return undefined;
  }

  return { element, form: form.props.name };
}

/**
 * Get a Button or an Input from an interface.
 *
 * @param content - The interface content.
 * @param name - The element name.
 * @returns An object containing the element and the form name if it's contained
 * in a form, otherwise undefined.
 */
export function getElement(
  content: JSXElement,
  name: string,
):
  | {
      element: ButtonElement | InputElement;
      form?: string;
    }
  | undefined {
  const { type } = content;
  if ((type === 'Button' || type === 'Input') && content.props.name === name) {
    return { element: content };
  }

  return walkJsx(content, (element) => {
    if (element.type === 'Form') {
      return getFormElement(element, name);
    }

    if (
      (element.type === 'Button' || element.type === 'Input') &&
      element.props.name === name
    ) {
      return { element };
    }

    return undefined;
  });
}
/**
 * Handle submitting event requests to OnUserInput including unwrapping potential errors.
 *
 * @param controllerMessenger - The controller messenger used to call actions.
 * @param snapId - The Snap ID.
 * @param id - The interface ID.
 * @param event - The event to submit.
 */
async function handleEvent(
  controllerMessenger: RootControllerMessenger,
  snapId: SnapId,
  id: string,
  event: UserInputEvent,
) {
  try {
    await controllerMessenger.call(
      'ExecutionService:handleRpcRequest',
      snapId,
      {
        origin: '',
        handler: HandlerType.OnUserInput,
        request: {
          jsonrpc: '2.0',
          method: ' ',
          params: {
            event,
            id,
          },
        },
      },
    );
  } catch (error) {
    const [unwrapped] = unwrapError(error);
    throw unwrapped;
  }
}

/**
 * Click on an element of the Snap interface.
 *
 * @param controllerMessenger - The controller messenger used to call actions.
 * @param id - The interface ID.
 * @param content - The interface content.
 * @param snapId - The Snap ID.
 * @param name - The element name.
 */
export async function clickElement(
  controllerMessenger: RootControllerMessenger,
  id: string,
  content: JSXElement,
  snapId: SnapId,
  name: string,
): Promise<void> {
  const result = getElement(content, name);
  assert(
    result !== undefined && result.element.type === 'Button',
    'No button found in the interface.',
  );

  // Button click events are always triggered.
  await handleEvent(controllerMessenger, snapId, id, {
    type: UserInputEventType.ButtonClickEvent,
    name: result.element.props.name,
  });

  if (result.form && result.element.props.type === 'submit') {
    const { state } = controllerMessenger.call(
      'SnapInterfaceController:getInterface',
      snapId,
      id,
    );

    await handleEvent(controllerMessenger, snapId, id, {
      type: UserInputEventType.FormSubmitEvent,
      name: result.form,
      value: state[result.form] as Record<string, string | null>,
    });
  }
}

/**
 * Merge a value in the interface state.
 *
 * @param state - The actual interface state.
 * @param name - The component name that changed value.
 * @param value - The new value.
 * @param form - The form name if the element is in one.
 * @returns The state with the merged value.
 */
export function mergeValue(
  state: InterfaceState,
  name: string,
  value: string | null,
  form?: string,
): InterfaceState {
  if (form) {
    return {
      ...state,
      [form]: {
        ...(state[form] as FormState),
        [name]: value,
      },
    };
  }

  return { ...state, [name]: value };
}

/**
 * Type a value in an interface element.
 *
 * @param controllerMessenger - The controller messenger used to call actions.
 * @param id - The interface ID.
 * @param content - The interface Components.
 * @param snapId - The Snap ID.
 * @param name - The element name.
 * @param value - The value to type in the element.
 */
export async function typeInField(
  controllerMessenger: RootControllerMessenger,
  id: string,
  content: JSXElement,
  snapId: SnapId,
  name: string,
  value: string,
) {
  const result = getElement(content, name);

  assert(
    result !== undefined && result.element.type === 'Input',
    'No input found in the interface.',
  );

  const { state } = controllerMessenger.call(
    'SnapInterfaceController:getInterface',
    snapId,
    id,
  );

  const newState = mergeValue(state, name, value, result.form?.props.name);

  controllerMessenger.call(
    'SnapInterfaceController:updateInterfaceState',
    id,
    newState,
  );

  await controllerMessenger.call('ExecutionService:handleRpcRequest', snapId, {
    origin: '',
    handler: HandlerType.OnUserInput,
    request: {
      jsonrpc: '2.0',
      method: ' ',
      params: {
        event: {
          type: UserInputEventType.InputChangeEvent,
          name: result.element.props.name,
          value,
        },
        id,
      },
    },
  });
}

/**
 * Get a user interface object from a Snap.
 *
 * @param runSaga - A function to run a saga outside the usual Redux flow.
 * @param snapId - The Snap ID.
 * @param controllerMessenger - The controller messenger used to call actions.
 * @yields Takes the set interface action.
 * @returns The user interface object.
 */
export function* getInterface(
  runSaga: RunSagaFunction,
  snapId: SnapId,
  controllerMessenger: RootControllerMessenger,
): SagaIterator<SnapInterface> {
  const { type, id, content } = yield call(
    getStoredInterface,
    controllerMessenger,
    snapId,
  );

  const interfaceActions = {
    clickElement: async (name: string) => {
      await clickElement(controllerMessenger, id, content, snapId, name);
    },
    typeInField: async (name: string, value: string) => {
      await typeInField(controllerMessenger, id, content, snapId, name, value);
    },
  };

  return getInterfaceResponse(runSaga, type, content, interfaceActions);
}
