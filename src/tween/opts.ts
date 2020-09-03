import { Easing } from 'easing';

export interface TweenOpts extends Partial<DefaultableTweenOpts> {
  startTime?: number;
}

export interface DefaultableTweenOpts {
  length: number;
  easing: Easing;
}

export function cloneTweenOpts<T extends TweenOpts>(opts: T): T {
  return {...opts};
}