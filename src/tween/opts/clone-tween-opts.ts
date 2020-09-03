import { TweenOpts } from './opts';

export function cloneTweenOpts<T extends TweenOpts>(opts: T): T {
  return { ...opts };
}
