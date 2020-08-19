import { TweenToStep } from './tween-to-step';

export interface TweenFromStep<T> {
  get: (start: T) => TweenToStep<T>;
}
