import { InterpolatorToStep as InterpolatorToStep } from './interpolator-to-step';
import { InterpolatorBuilder } from './interpolator-builder';

export function get<T>(start: T): InterpolatorToStep<T> {
  return new InterpolatorBuilder<T>().get(start);
}
