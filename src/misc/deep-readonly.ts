export type DeepReadonly<T> =
  T extends (...args: any) => any
  ? T
  : { readonly [P in keyof T]: DeepReadonly<T[P]> };