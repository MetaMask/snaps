import type {
  FormState,
  InterfaceContext,
  InterfaceState,
  SnapId,
  UserInputEvent,
  File,
} from '@metamask/snaps-sdk';
import { DialogType, UserInputEventType, assert } from '@metamask/snaps-sdk';
import type { FormElement, JSXElement } from '@metamask/snaps-sdk/jsx';
import {
  HandlerType,
  getJsxChildren,
  unwrapError,
  walkJsx,
} from '@metamask/snaps-utils';
import { hasProperty } from '@metamask/utils';
import type { PayloadAction } from '@reduxjs/toolkit';
import { type SagaIterator } from 'redux-saga';
import { call, put, select, take } from 'redux-saga/effects';

import type { SnapInterface, SnapInterfaceActions } from '../../types';
import type { RootControllerMessenger } from './controllers';
import { getFileToUpload } from './files';
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
 * A JSX element with a name.
 */
export type NamedJSXElement = JSXElement & { props: { name: string } };

/**
 * Check if a JSX element is a JSX element with a given name.
 *
 * @param element - The JSX element.
 * @param name - The element name.
 * @returns True if the element is a JSX element with the given name, otherwise
 * false.
 */
function isJSXElementWithName<Element extends JSXElement, Name extends string>(
  element: Element,
  name: Name,
): element is Element & { props: { name: Name } } {
  return hasProperty(element.props, 'name') && element.props.name === name;
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
  const element = walkJsx<NamedJSXElement>(form, (childElement) => {
    if (isJSXElementWithName(childElement, name)) {
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
 * Get an element from a JSX tree with the given name.
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
      element: NamedJSXElement;
      form?: string;
    }
  | undefined {
  if (isJSXElementWithName(content, name)) {
    return { element: content };
  }

  return walkJsx(content, (element) => {
    if (element.type === 'Form') {
      return getFormElement(element, name);
    }

    if (isJSXElementWithName(element, name)) {
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
 * @param context - The interface context.
 */
async function handleEvent(
  controllerMessenger: RootControllerMessenger,
  snapId: SnapId,
  id: string,
  event: UserInputEvent,
  context: InterfaceContext | null,
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
            context,
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
 * The values and files of a form.
 *
 * @property value - The values of the form fields, if any.
 * @property files - The files of the form fields, if any.
 */
export type FormValues = {
  value: Record<string, string | null>;
  files: Record<string, File | null>;
};

/**
 * Get the form values from the interface state. If the event is not a form
 * submit event, an empty object is returned. Otherwise, the form values are
 * extracted from the state, and the values and files are returned separately.
 *
 * @param state - The interface state.
 * @returns The form values.
 */
export function getFormValues(state?: FormState): FormValues {
  if (!state) {
    return { value: {}, files: {} };
  }

  return Object.entries(state).reduce<FormValues>(
    (accumulator, [key, value]) => {
      const formValue = value as string | File | null;
      if (formValue) {
        if (typeof formValue === 'string') {
          accumulator.value[key] = formValue;
        } else {
          accumulator.files[key] = formValue;
        }
      }

      return accumulator;
    },
    { value: {}, files: {} },
  );
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
    result !== undefined,
    `Could not find an element in the interface with the name "${name}".`,
  );

  assert(
    result.element.type === 'Button',
    `Expected an element of type "Button", but found "${result.element.type}".`,
  );

  const { state, context } = controllerMessenger.call(
    'SnapInterfaceController:getInterface',
    snapId,
    id,
  );

  // Button click events are always triggered.
  await handleEvent(
    controllerMessenger,
    snapId,
    id,
    {
      type: UserInputEventType.ButtonClickEvent,
      name: result.element.props.name,
    },
    context,
  );

  if (result.form && result.element.props.type === 'submit') {
    await handleEvent(
      controllerMessenger,
      snapId,
      id,
      {
        type: UserInputEventType.FormSubmitEvent,
        name: result.form,
        value: state[result.form] as FormState,
      },
      context,
    );
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
  value: string | File | null,
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
    result !== undefined,
    `Could not find an element in the interface with the name "${name}".`,
  );

  assert(
    result.element.type === 'Input',
    `Expected an element of type "Input", but found "${result.element.type}".`,
  );

  const { state, context } = controllerMessenger.call(
    'SnapInterfaceController:getInterface',
    snapId,
    id,
  );

  const newState = mergeValue(state, name, value, result.form);

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
        context,
      },
    },
  });
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
export async function selectInDropdown(
  controllerMessenger: RootControllerMessenger,
  id: string,
  content: JSXElement,
  snapId: SnapId,
  name: string,
  value: string,
) {
  const result = getElement(content, name);

  assert(
    result !== undefined,
    `Could not find an element in the interface with the name "${name}".`,
  );

  assert(
    result.element.type === 'Dropdown',
    `Expected an element of type "Dropdown", but found "${result.element.type}".`,
  );

  const options = getJsxChildren(result.element) as JSXElement[];
  const selectedOption = options.find(
    (option) =>
      hasProperty(option.props, 'value') && option.props.value === value,
  );

  assert(
    selectedOption !== undefined,
    `The dropdown with the name "${name}" does not contain "${value}".`,
  );

  const { state, context } = controllerMessenger.call(
    'SnapInterfaceController:getInterface',
    snapId,
    id,
  );

  const newState = mergeValue(state, name, value, result.form);

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
        context,
      },
    },
  });
}

/**
 * Upload a file to an interface element.
 *
 * @param controllerMessenger - The controller messenger used to call actions.
 * @param id - The interface ID.
 * @param content - The interface Components.
 * @param snapId - The Snap ID.
 * @param name - The element name.
 * @param file - The file to upload. This can be a path to a file or a
 * `Uint8Array` containing the file contents. If this is a path, the file is
 * resolved relative to the current working directory.
 * @param fileName - The name of the file. By default, this is inferred from the
 * file path if it's a path, and defaults to an empty string if it's a
 * `Uint8Array`.
 * @param contentType - The content type of the file. By default, this is
 * inferred from the file name if it's a path, and defaults to
 * `application/octet-stream` if it's a `Uint8Array` or the content type cannot
 * be inferred from the file name.
 */
export async function uploadFile(
  controllerMessenger: RootControllerMessenger,
  id: string,
  content: JSXElement,
  snapId: SnapId,
  name: string,
  file: string | Uint8Array,
  fileName?: string,
  contentType?: string,
) {
  const result = getElement(content, name);

  assert(
    result !== undefined,
    `Could not find an element in the interface with the name "${name}".`,
  );

  assert(
    result.element.type === 'FileInput',
    `Expected an element of type "FileInput", but found "${result.element.type}".`,
  );

  const { state, context } = controllerMessenger.call(
    'SnapInterfaceController:getInterface',
    snapId,
    id,
  );

  const fileObject = await getFileToUpload(file, fileName, contentType);
  const newState = mergeValue(state, name, fileObject, result.form);

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
          type: UserInputEventType.FileUploadEvent,
          name: result.element.props.name,
          file: fileObject,
        },
        id,
        context,
      },
    },
  });
}

/**
 * Get the user interface actions for a Snap interface. These actions can be
 * used to interact with the interface.
 *
 * @param snapId - The Snap ID.
 * @param controllerMessenger - The controller messenger used to call actions.
 * @param interface - The interface object.
 * @param interface.content - The interface content.
 * @param interface.id - The interface ID.
 * @returns The user interface actions.
 */
export function getInterfaceActions(
  snapId: SnapId,
  controllerMessenger: RootControllerMessenger,
  { content, id }: Omit<Interface, 'type'> & { content: JSXElement },
): SnapInterfaceActions {
  return {
    clickElement: async (name: string) => {
      await clickElement(controllerMessenger, id, content, snapId, name);
    },

    typeInField: async (name: string, value: string) => {
      await typeInField(controllerMessenger, id, content, snapId, name, value);
    },

    selectInDropdown: async (name: string, value: string) => {
      await selectInDropdown(
        controllerMessenger,
        id,
        content,
        snapId,
        name,
        value,
      );
    },

    uploadFile: async (
      name: string,
      file: string | Uint8Array,
      fileName?: string,
      contentType?: string,
    ) => {
      await uploadFile(
        controllerMessenger,
        id,
        content,
        snapId,
        name,
        file,
        fileName,
        contentType,
      );
    },
  };
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
  const storedInterface = yield call(
    getStoredInterface,
    controllerMessenger,
    snapId,
  );

  const interfaceActions = getInterfaceActions(
    snapId,
    controllerMessenger,
    storedInterface,
  );

  return getInterfaceResponse(
    runSaga,
    storedInterface.type,
    storedInterface.content,
    interfaceActions,
  );
}
