import { Easing } from 'easing';

export interface TweenOpts {
  length?: number;
  easing?: Easing;
}

export function cloneTweenOpts<T extends TweenOpts>(opts: T): T {
  return {...opts};
}
