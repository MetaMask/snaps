import type { Component, SnapId } from '@metamask/snaps-sdk';
import { DialogType } from '@metamask/snaps-sdk';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';
import { put, select, take } from 'redux-saga/effects';

import type { SnapInterface } from '../../types';
import type { RootControllerMessenger } from './controllers';
import type { Interface, RunSagaFunction } from './store';
import { getCurrentInterface, resolveInterface, setInterface } from './store';

/**
 * Get a user interface object from a type and content object.
 *
 * @param runSaga - A function to run a saga outside the usual Redux flow.
 * @param type - The type of the interface.
 * @param content - The content to show in the interface.
 * @returns The user interface object.
 */
export function getInterfaceResponse(
  runSaga: RunSagaFunction,
  type: DialogType,
  content: Component,
): SnapInterface {
  switch (type) {
    case DialogType.Alert:
      return {
        type,
        content,
        ok: resolveWith(runSaga, null),
      };

    case DialogType.Confirmation:
      return {
        type,
        content,

        ok: resolveWith(runSaga, true),
        cancel: resolveWith(runSaga, false),
      };

    case DialogType.Prompt:
      return {
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
  const currentInterface: Interface | null = yield select(getCurrentInterface);
  if (currentInterface) {
    const { content } = controllerMessenger.call(
      'SnapInterfaceController:getInterface',
      snapId,
      currentInterface.id,
    );
    return getInterfaceResponse(runSaga, currentInterface.type, content);
  }

  const { payload }: PayloadAction<Interface> = yield take(setInterface.type);
  const { type, id } = payload;

  const { content } = controllerMessenger.call(
    'SnapInterfaceController:getInterface',
    snapId,
    id,
  );

  return getInterfaceResponse(runSaga, type, content);
}
