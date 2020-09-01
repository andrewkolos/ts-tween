import { TweenToStep } from './tween-to-step';

export interface TweenFromStep<T> {
  get: (target: T) => TweenToStep<T>;
}
