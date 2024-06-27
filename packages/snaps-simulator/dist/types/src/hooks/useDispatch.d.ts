import type { Dispatch } from '../store/store';
/**
 * A hook to access the Redux dispatch function.
 *
 * This is a wrapper around the `useDispatch` hook from `react-redux`, to
 * provide a type-safe `Dispatch` type.
 *
 * @returns The Redux dispatch function.
 */
export declare const useDispatch: () => Dispatch;
