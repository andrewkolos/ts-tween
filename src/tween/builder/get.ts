import { TweenToStep } from './tween-to-step';
import { TweenBuilder } from './tween-builder';

export function get<T>(start: T): TweenToStep<T> {
  return new TweenBuilder<T>().get(start);
}
