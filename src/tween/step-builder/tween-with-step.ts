import { Tween } from '../tween';
import { TweenOptions } from '../opts';

export interface TweenWithStep<T> {
  /**
   * Complete the construction of the Tween, using the provided options.
   * @param options The options/configuration to provide to the Tween.
   * @returns The completed Tween.
   */
  with: (options: TweenOptions) => Tween<T>;
}
