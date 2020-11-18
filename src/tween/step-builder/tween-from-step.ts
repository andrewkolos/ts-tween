import { TweenToStep } from './tween-to-step';

export interface TweenFromStep<T> {
  /**
   * Specifies the target to tween. Can be a value or an object.
   */
  get: (target: T) => TweenToStep<T>;
}
