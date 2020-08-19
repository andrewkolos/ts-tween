import { Tween } from '../tween';
import { TweenOpts } from '../opts';

export interface TweenWithStep<T> {
  withDefaults: () => Tween<T>;
  overTime: (length: number) => Tween<T>;
  with: (options: TweenOpts) => Tween<T>;
}
