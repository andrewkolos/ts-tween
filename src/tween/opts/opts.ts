import { DefaultableTweenOpts } from './defaultable-tween-opts';

export interface TweenOpts extends Partial<DefaultableTweenOpts> {
  startTime?: number;
}

