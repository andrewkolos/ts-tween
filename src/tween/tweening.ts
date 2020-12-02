import dedent from 'dedent';
import { Easing } from './../easing';
import { DeepPartial } from '../deep-partial';
import { cloneCommonProps } from './clone-common-props';
import { clone } from './clone';

export function tweening<T>(target: T, end: DeepPartial<T>, easing: Easing): Tweening<T> {
  const start = cloneCommonProps(target, end);
  const tweenToDefensiveCopy = clone(end);
  return (progress: number) => tweenInternal(start, tweenToDefensiveCopy, progress, easing, target) as T;
}

export type Tweening<T> = (progress: number) => T;

export function tweenInternal<T>(start: T, end: DeepPartial<T>, progress: number, easingFunction: Easing, writeTo: T): T {

  if (typeof end === 'number') {
    if (typeof start !== 'number') throwTypeMismatchError(start, end);
    if (Math.abs(start) === Infinity || Math.abs(end) === Infinity) {
      throw Error('Cannot tween to or from infinity.');
    }
    // Have to assert type here because of a TS bug as of 8/8/20.
    // The type of from/to is incorrectly inferred as T & number.
    return lerp(start, end, easingFunction(progress)) as unknown as T;
  } else if (typeof end === 'object') {
    if (typeof start !== 'object') throwTypeMismatchError(start, end);
    tweenObj(start as any, end, progress, easingFunction, writeTo);
    return writeTo;
  } else {
    throw Error(`Do not know how to tween value of type ${typeof end}.`);
  }


}

function tweenObj<T extends object>(start: T, end: DeepPartial<T>, progress: number, easingFunction: Easing, writeTo: T) {
  Object.keys(end).forEach((k: string) => {
    if (!(k in start)) {
      throw Error(dedent`Property '${k}' is missing in the target object.`);
    }

    const key = k as keyof T;
    const fromValue = start[key];
    const toValue = end[key] as T[keyof T];

    if (typeof fromValue === 'object') {
      if (typeof toValue !== 'object') throwTypeMismatchError(start, end);
      tweenObj(fromValue as any, toValue, progress, easingFunction, writeTo[key]);
    } else {
      writeTo[key] = tweenInternal(fromValue, toValue, progress, easingFunction, writeTo[key]);
    }
  });
}

function throwTypeMismatchError(start: any, end: any): never {
  throw Error(dedent`The type of the value to tween from does not match
                       the type of the value to tween to. Found values with types
                       or properties with types: from: ${start}, to: ${end}`);
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}
