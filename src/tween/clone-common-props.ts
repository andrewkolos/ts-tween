import dedent from 'dedent';
import { DeepPartial } from '../deep-partial';

export function cloneCommonProps<L, R extends DeepPartial<L>>(cloneFrom: L, lookForPropsIn: R): R {
  switch (typeof lookForPropsIn) {
    case 'number':
    case 'boolean':
    case 'string':
      if (typeof lookForPropsIn !== typeof cloneFrom) throwTypeMismatchError();
      // Type inference does not work with `switch` statements, so we have to assert here.
      return cloneFrom as unknown as R;
    case 'object':
      if (Array.isArray(cloneFrom) !== Array.isArray(lookForPropsIn)) throwTypeMismatchError();
      const result = (Array.isArray(lookForPropsIn) ? [] : {}) as R;

      Object.keys(lookForPropsIn).forEach((k: string) => {
        if (!(k in cloneFrom))
          throw Error(`Property '${k}' is missing from the left object.`);

        const key = k as keyof L & keyof R;
        result[key] = cloneCommonProps(cloneFrom[key], lookForPropsIn[key]);
      });

      return result;
    default:
      throw Error(`Unable to clone a value of type ${typeof lookForPropsIn}`);
  }

  function throwTypeMismatchError(): never {
    throw Error(dedent`The type of a property in the left object did not match
                       the type of the corresponding property in the right object.
                       Left: ${cloneFrom} Right: ${lookForPropsIn}`);
  }
}


