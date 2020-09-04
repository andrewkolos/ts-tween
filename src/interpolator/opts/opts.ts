import { DefaultableInterpolatorOpts } from './defaultable-tween-opts';

export interface InterpolatorOpts extends Partial<DefaultableInterpolatorOpts> {
  startTime?: number;
}

export namespace InterpolatorOpts {
  export function clone<T extends InterpolatorOpts>(opts: T): T {
    return { ...opts };
  }
}
