import { Interpolator } from '../interpolator';
import { InterpolatorOpts } from '../opts/opts';
import { InterpolatorFromStep } from './interpolator-from-step';
import { InterpolatorToStep } from './interpolator-to-step';
import { TweenWithStep } from './interpolator-with-step';

/**
 * Builds instances of Interpolator using an ordered process of steps, as an alternative to the constructor syntax.
 * @template T The type of the value to be tweened.
 */
export class InterpolatorBuilder<T> implements InterpolatorFromStep<T>, InterpolatorToStep<T>, TweenWithStep<T> {
  private target?: T;
  private destination?: Partial<T>;

  public get(target: T): InterpolatorToStep<T> {
    this.target = target;
    return this;
  }

  /**
   * @param destination The value to interpolate towards.
   * @returns The next step in the building process, where the configuration of the Interpolator is provided.
   */
  public to(destination: Partial<T>): TweenWithStep<T> {
    this.destination = destination;
    return this;
  }

  /**
   * Complete the construction of the Interpolator, using the current default options.
   * @returns The completed Interpolator.
   */
  public withDefaults(): Interpolator<T> {
    if (this.target == null || this.destination == null) {
      throw Error('Missing information required to create Interpolator.');
    }
    return new Interpolator(this.target, this.destination, Interpolator.defaults());
  }

  /**
   * Complete the construction of the Interpolator, using the provided options.
   * @param options The options/configuration to provide to the Interpolator.
   * @returns The completed Interpolator.
   */
  public with(options: InterpolatorOpts): Interpolator<T> {
    if (this.target == null || this.destination == null) {
      throw Error('Missing information required to create Interpolator.');
    }
    return new Interpolator(this.target, this.destination, options);
  }

  /**
   * Complete the construction of the Interpolator, using the default options, but with a provided duration/length.
   * @param length The length or duration of the Interpolator.
   * @returns The completed Interpolator.
   */
  public overTime(length: number): Interpolator<T> {
    if (this.target == null || this.destination == null) {
      throw Error('Missing information required to create Interpolator.');
    }
    return new Interpolator(this.target, this.destination, { length });
  }

}

export namespace InterpolatorBuilder {
  export interface ToStep<T> extends InterpolatorToStep<T> { };
  export interface FromStep<T> extends InterpolatorFromStep<T> {};
  export interface WithStep<T> extends TweenWithStep<T> {};
}
