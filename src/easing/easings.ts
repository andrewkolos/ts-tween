import { DeepReadonly } from 'ts-essentials';

const { cos, sin, PI, pow, sqrt } = Math;

// This constant is more akin to a namespace, so prefer capitalization here.
// tslint:disable-next-line: variable-name
export const Easings = deepFreeze({
  linear(t: number): number {
    return t;
  },
  inSine(t: number): number {
    return 1 - cos((t * PI) / 2);
  },
  outSine(t: number): number {
    return sin((t * PI) / 2);
  },
  inOutSine(t: number): number {
    return -(cos(PI * t) - 1) / 2;
  },
  inQuad(t: number): number {
    return t * t;
  },
  outQuad(t: number): number {
    return 1 - (1 - t) * (1 - t);
  },
  inOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - pow(-2 * t + 2, 2) / 2;
  },
  inCubic(t: number): number {
    return t * t * t;
  },
  outCubic(t: number): number {
    return 1 - pow(1 - t, 3);
  },
  inOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2;
  },
  inQuart(t: number): number {
    return t * t * t * t;
  },
  outQuart(t: number): number {
    return 1 - pow(1 - t, 4);
  },
  inOutQuart(t: number): number {
    return t < 0.5 ? 8 * t * t * t * t : 1 - pow(-2 * t + 2, 4) / 2;
  },
  inQuint(t: number): number {
    return t * t * t * t * t;
  },
  outQuint(t: number): number {
    return 1 - pow(1 - t, 5);
  },
  inOutQuint(t: number): number {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 - pow(-2 * t + 2, 5) / 2;
  },
  inEtpo(t: number): number {
    return t === 0 ? 0 : pow(2, 10 * t - 10);
  },
  outEtpo(t: number): number {
    return t === 1 ? 1 : 1 - pow(2, -10 * t);
  },
  inOutEpto(t: number): number {
    return t === 0
      ? 0
      : t === 1
        ? 1
        : t < 0.5 ? pow(2, 20 * t - 10) / 2
          : (2 - pow(2, -20 * t + 10)) / 2;
  },
  inCirc(t: number): number {
    return 1 - sqrt(1 - pow(t, 2));
  },
  outCirc(t: number): number {
    return sqrt(1 - pow(t - 1, 2));
  },
  inOutCirc(t: number): number {
    return t < 0.5
      ? (1 - sqrt(1 - pow(2 * t, 2))) / 2
      : (sqrt(1 - pow(-2 * t + 2, 2)) + 1) / 2;
  },
  inBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;

    return c3 * t * t * t - c1 * t * t;
  },
  outBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;

    return 1 + c3 * pow(t - 1, 3) + c1 * pow(t - 1, 2);
  },
  inOutBack(t: number): number {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;

    return t < 0.5
      ? (pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  inElastic(t: number): number {
    const c4 = (2 * Math.PI) / 3;

    return t === 0
      ? 0
      : t === 1
        ? 1
        : -pow(2, 10 * t - 10) * sin((t * 10 - 10.75) * c4);
  },
  outElastic(t: number): number {
    const c4 = (2 * Math.PI) / 3;

    return t === 0
      ? 0
      : t === 1
        ? 1
        : pow(2, -10 * t) * sin((t * 10 - 0.75) * c4) + 1;
  },
  inOutElastic(t: number): number {
    const c5 = (2 * Math.PI) / 4.5;

    return t === 0
      ? 0
      : t === 1
        ? 1
        : t < 0.5
          ? -(pow(2, 20 * t - 10) * sin((20 * t - 11.125) * c5)) / 2
          : (pow(2, -20 * t + 10) * sin((20 * t - 11.125) * c5)) / 2 + 1;
  },
  outBounce(t: number): number {
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
  inBounce(t: number): number {
    return 1 - Easings.outBounce(1 - t);
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