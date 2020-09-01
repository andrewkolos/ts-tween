export type Intersect<O, M> = O extends object ? RemoveNever<(M extends object ? {
  [P in (keyof O & keyof M)]: Intersect<O[P], M[P]>
} : never)> : O & M;

type KeysOfNever<T> = ({ [P in keyof T]: T[P] extends never ? P : never })[keyof T];
type RemoveNever<T> = T extends object ? {
  [K in Exclude<keyof T, KeysOfNever<T>>]: T[K]
} : T;
