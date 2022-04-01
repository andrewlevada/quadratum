export type FullPartial<T> = Partial<NullPartial<T>>;
export type NullPartial<T> = {[P in keyof T]: T[P] | null};
