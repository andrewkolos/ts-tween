import { DeepPartial } from '../deep-partial';
import { TweenOptions } from './opts';
import { Tween } from './tween';

export function tween<T>(target: T, propDests: DeepPartial<T>, opts: TweenOptions): Tween<T> {
  return new Tween(target, propDests, opts);
}
