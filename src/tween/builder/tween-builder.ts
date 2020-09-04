import { Tween } from '../tween';
import { TweenOpts } from '../opts/opts';
import { TweenFromStep } from './tween-from-step';
import { TweenToStep } from './tween-to-step';
import { TweenWithStep } from './tween-with-step';

/**
 * Builds instances of Tween using an ordered process of steps, as an alternative to the constructor syntax.
 * @template T The type of the value to be tweened.
 */
export class TweenBuilder<T> implements TweenFromStep<T>, TweenToStep<T>, TweenWithStep<T> {
  private target?: T;
  private destination?: Partial<T>;

  public get(target: T): TweenToStep<T> {
    this.target = target;
    return this;
  }

  /**
   * @param destination The value to interpolate towards.
   * @returns The next step in the building process, where the configuration of the Tween is provided.
   */
  public to(destination: Partial<T>): TweenWithStep<T> {
    this.destination = destination;
    return this;
  }

  /**
   * Complete the construction of the Tween, using the current default options.
   * @returns The completed Tween.
   */
  public withDefaults(): Tween<T> {
    if (this.target == null || this.destination == null) {
      throw Error('Missing information required to create Tween.');
    }
    return new Tween(this.target, this.destination, Tween.defaults());
  }

  /**
   * Complete the construction of the Tween, using the provided options.
   * @param options The options/configuration to provide to the Tween.
   * @returns The completed Tween.
   */
  public with(options: TweenOpts): Tween<T> {
    if (this.target == null || this.destination == null) {
      throw Error('Missing information required to create Tween.');
    }
    return new Tween(this.target, this.destination, options);
  }

  /**
   * Complete the construction of the Tween, using the default options, but with a provided duration/length.
   * @param length The length or duration of the Tween.
   * @returns The completed Tween.
   */
  public overTime(length: number): Tween<T> {
    if (this.target == null || this.destination == null) {
      throw Error('Missing information required to create Tween.');
    }
    return new Tween(this.target, this.destination, { length });
  }

}

export namespace TweenBuilder {
  export interface ToStep<T> extends TweenToStep<T> { };
  export interface FromStep<T> extends TweenFromStep<T> {};
  export interface WithStep<T> extends TweenWithStep<T> {};
}
