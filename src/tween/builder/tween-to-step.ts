import { TweenWithStep } from './tween-with-step';

export interface TweenToStep<T> {
  to: (destination: Partial<T>) => TweenWithStep<T>;
}
