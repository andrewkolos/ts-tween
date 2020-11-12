import { TweenWithStep } from './tween-with-step';

/**
 * @param destination The value to interpolate towards.
 * @returns The next step in the building process, where the configuration of the Tween is provided.
 */
export interface TweenToStep<T> {
  to: (destination: Partial<T>) => TweenWithStep<T>;
}
