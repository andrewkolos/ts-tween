import { DefaultableTweenOpts } from './defaultable-tween-opts';

export interface TweenOpts extends Partial<DefaultableTweenOpts> {
  startTime?: number;
}

export namespace TweenOpts {
  export function clone<T extends TweenOpts>(opts: T): T {
    return { ...opts };
  }
}
