import { DeepPartial } from '../deep-partial';
import { TweenOptions } from './opts';
import { Tween } from './tween';
import { tween } from './tween-factory-func';

export type TweenFactory = <T>(target: T, propDests: DeepPartial<T>) => Tween<T>;

export function makeTweenFactory(opts: TweenOptions): TweenFactory {
  return <T>(target: T, propDests: DeepPartial<T>) => tween(target, propDests, opts);
}
