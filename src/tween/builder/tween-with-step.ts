import { Tween } from '../tween';
import { TweenOpts } from '../opts';

export interface TweenWithStep<T> {
  /**
   * Complete the construction of the Tween, using the provided options.
   * @param options The options/configuration to provide to the Tween.
   * @returns The completed Tween.
   */
  with: (options: TweenOpts) => Tween<T>;
}
