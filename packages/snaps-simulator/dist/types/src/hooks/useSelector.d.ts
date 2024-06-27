import type { TypedUseSelectorHook } from 'react-redux';
import type { ApplicationState } from '../store/store';
/**
 * A hook to access the Redux store's state.
 *
 * This is a wrapper around the `useSelector` hook from `react-redux`, to
 * provide a type-safe `ApplicationState` type.
 *
 * @returns The Redux store's state.
 */
export declare const useSelector: TypedUseSelectorHook<ApplicationState>;
