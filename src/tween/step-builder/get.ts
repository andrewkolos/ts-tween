import { TweenToStep } from './tween-to-step';
import { TweenStepBuilder } from './tween-step-builder';

export function get<T>(start: T): TweenToStep<T> {
  return new TweenStepBuilder<T>().get(start);
}
