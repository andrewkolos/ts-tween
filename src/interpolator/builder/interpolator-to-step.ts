import { TweenWithStep } from './interpolator-with-step';

/**
 * @param destination The value to interpolate towards.
 * @returns The next step in the building process, where the configuration of the Interpolator is provided.
 */
export interface InterpolatorToStep<T> {
  to: (destination: Partial<T>) => TweenWithStep<T>;
}
