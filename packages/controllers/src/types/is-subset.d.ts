declare module 'is-subset' {
  export type intersectObjects = (
    arg1?: Record<string, any>,
    arg2?: Record<string, any>,
  ) => Record<string, any>;
  export default function isSubset(superset: unknown, subset: unknown): boolean;
}
