// @ts-ignore
import { EasingFunction } from './easings';
import { DeepReadonly } from 'ts-essentials';

const { cos, sin, PI, pow, sqrt } = Math;

// This constant is more akin to a namespace, so prefer capitalization here.
// tslint:disable-next-line: variable-name
export const Easings = deepFreeze({
  linear(t: number): number {
    return t;
  },
  easeInSine(t: number): number {
    return 1 - cos((t * PI) / 2);
  },
  easeOutSine(t: number): number {
    return sin((t * PI) / 2);
  },
  easeInOutSine(t: number): number {
    return -(cos(PI * t) - 1) / 2;
  },
  easeInQuad(t: number): number {
    return t * t;
  },
  easeOutQuad(t: number): number {
    return 1 - (1 - t) * (1 - t);
  },
  easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - pow(-2 * t + 2, 2) / 2;
  },
  easeInCubic(t: number): number {
    return t * t * t;
  },
  easeOutCubic(t: number): number {
    return 1 - pow(1 - t, 3);
  },
  easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2;
  },
  easeInQuart(t: number): number {
    return t * t * t * t;
  },
  easeOutQuart(t: number): number {
    return 1 - pow(1 - t, 4);
  },
  easeInOutQuart(t: number): number {
    return t < 0.5 ? 8 * t * t * t * t : 1 - pow(-2 * t + 2, 4) / 2;
  },
  easeInQuint(t: number): number {
    return t * t * t * t * t;
  },
  easeOutQuint(t: number): number {
    return 1 - pow(1 - t, 5);
  },
  easeInOutQuint(t: number): number {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 - pow(-2 * t + 2, 5) / 2;
  },
  easeInEtpo(t: number): number {
    return t === 0 ? 0 : pow(2, 10 * t - 10);
  },
  easeOutEtpo(t: number): number {
    return t === 1 ? 1 : 1 - pow(2, -10 * t);
  },
  easeInOutEtpo(t: number): number {
    return t === 0
      ? 0
      : t === 1
        ? 1
        : t < 0.5 ? pow(2, 20 * t - 10) / 2
          : (2 - pow(2, -20 * t + 10)) / 2;
  },
  easeInCirc(t: number): number {
    return 1 - sqrt(1 - pow(t, 2));
  },
  easeOutCirc(t: number): number {
    return sqrt(1 - pow(t - 1, 2));
  },
  easeInOutCirc(t: number): number {
    return t < 0.5
      ? (1 - sqrt(1 - pow(2 * t, 2))) / 2
      : (sqrt(1 - pow(-2 * t + 2, 2)) + 1) / 2;
  },
  easeInBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;

    return c3 * t * t * t - c1 * t * t;
  },
  easeOutBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;

    return 1 + c3 * pow(t - 1, 3) + c1 * pow(t - 1, 2);
  },
  easeInOutBack(t: number): number {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;

    return t < 0.5
      ? (pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  easeInElastic(t: number): number {
    const c4 = (2 * Math.PI) / 3;

    return t === 0
      ? 0
      : t === 1
        ? 1
        : -pow(2, 10 * t - 10) * sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic(t: number): number {
    const c4 = (2 * Math.PI) / 3;

    return t === 0
      ? 0
      : t === 1
        ? 1
        : pow(2, -10 * t) * sin((t * 10 - 0.75) * c4) + 1;
  },
  easeInOutElastic(t: number): number {
    const c5 = (2 * Math.PI) / 4.5;

    return t === 0
      ? 0
      : t === 1
        ? 1
        : t < 0.5
          ? -(pow(2, 20 * t - 10) * sin((20 * t - 11.125) * c5)) / 2
          : (pow(2, -20 * t + 10) * sin((20 * t - 11.125) * c5)) / 2 + 1;
  },
  easeOutBounce(t: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  easeInBounce(t: number): number {
    return 1 - Easings.easeOutBounce(1 - t);
  },
});

function deepFreeze<T>(o: T): DeepReadonly<T> {
  if (isObject(o)) {
    Object.freeze(o);
    for (const prop in o) {
      if (
        o.hasOwnProperty(prop) &&
        o[prop] !== null &&
        (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
        !Object.isFrozen(o[prop])
      ) {
        deepFreeze(o[prop]);
      }
    }
  }

  return o as DeepReadonly<T>;
}

function isObject(o: any): o is object {
  return typeof o === 'object' && o != null;
}