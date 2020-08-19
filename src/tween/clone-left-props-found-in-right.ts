import dedent from 'dedent';
import { DeepPartial } from 'deep-partial';

export function cloneLeftPropsFoundInRight<L, R extends DeepPartial<L>>(left: L, right: R): R {
  switch (typeof right) {
    case 'number':
    case 'boolean':
    case 'string':
      if (typeof right !== typeof left) throwTypeMismatchError();
      return left as unknown as R; // Type inference does not work with `switch` statements, so we have to assert here.
    case 'object':
      if (Array.isArray(left) !== Array.isArray(right)) throwTypeMismatchError();
      const result = (Array.isArray(right) ? [] : {}) as R;

      Object.keys(right).forEach((k: string) => {
        if (!(k in left))
          throw Error(`Property '${k}' is missing from the left object.`);

        const key = k as keyof L & keyof R;
        result[key] = cloneLeftPropsFoundInRight(left[key], right[key]);
      });

      return result;
    default:
      throw Error(`Unable to clone a value of type ${typeof right}`);
  }

  function throwTypeMismatchError(): never {
    throw Error(dedent`The type of a property in the left object did not match
                       the type of the corresponding property in the right object.
                       Left: ${left} Right: ${right}`);
  }
}

export function clone<T>(item: T): T {
  return cloneLeftPropsFoundInRight(item, item);
}
