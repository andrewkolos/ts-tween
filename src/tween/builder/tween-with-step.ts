import { Tween } from '../tween';
import { TweenOpts } from '../opts/opts';

export interface TweenWithStep<T> {
  /**
   * Complete the construction of the Tween, using the current default options.
   * @returns The completed Tween.
   */
  withDefaults: () => Tween<T>;

  /**
   * Complete the construction of the Tween, using the provided options.
   * @param options The options/configuration to provide to the Tween.
   * @returns The completed Tween.
   */
  with: (options: TweenOpts) => Tween<T>;

  /**
   * Complete the construction of the Tween, using the default options, but with a provided duration/length.
   * @param length The length or duration of the Tween.
   * @returns The completed Tween.
   */
  overTime: (length: number) => Tween<T>;
}
