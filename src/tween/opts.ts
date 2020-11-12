import { Easing } from '../easing';

export interface TweenOptions {
  easing: Easing;
  length: number;
}

export namespace TweenOptions {
  export function clone<T extends TweenOptions>(opts: T): T {
    return { ...opts };
  }
}
