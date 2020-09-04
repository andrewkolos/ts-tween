import { InterpolatorToStep } from './interpolator-to-step';

export interface InterpolatorFromStep<T> {
  get: (target: T) => InterpolatorToStep<T>;
}
