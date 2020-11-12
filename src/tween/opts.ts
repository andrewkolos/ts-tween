import { Easing } from '../easing';

export interface TweenOpts {
  easing: Easing;
  length: number;
}

export namespace TweenOpts {
  export function clone<T extends TweenOpts>(opts: T): T {
    return { ...opts };
  }
}
