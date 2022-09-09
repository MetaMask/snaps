export type PartialOrNull<T> = { [P in keyof T]?: T[P] | undefined | null };
