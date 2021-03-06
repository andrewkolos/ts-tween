import { Tween } from '../tween';
import { TweenOptions } from '../opts';
import { TweenFromStep } from './tween-from-step';
import { TweenToStep } from './tween-to-step';
import { TweenWithStep } from './tween-with-step';
import { DeepPartial } from '../../deep-partial';

/**
 * Builds instances of Tween using an ordered process of steps, as an alternative to the constructor syntax.
 * @template T The type of the value to be tweened.
 */
export class TweenStepBuilder<T> implements TweenFromStep<T>, TweenToStep<T>, TweenWithStep<T> {
  private target?: T;
  private destination?: DeepPartial<T>;

  public get(target: T): TweenToStep<T> {
    this.target = target;
    return this;
  }

  /**
   * @param destination The value to interpolate towards.
   * @returns The next step in the building process, where the configuration of the Tween is provided.
   */
  public to(destination: DeepPartial<T>): TweenWithStep<T> {
    this.destination = destination;
    return this;
  }

  /**
   * Complete the construction of the Tween, using the provided options.
   * @param options The options/configuration to provide to the Tween.
   * @returns The completed Tween.
   */
  public with(options: TweenOptions): Tween<T> {
    if (this.target == null || this.destination == null) {
      throw Error('Missing information required to create Tween.');
    }
    return Tween.start(this.target, this.destination, options);
  }

}

export namespace TweenStepBuilder {
  export interface ToStep<T> extends TweenToStep<T> { };
  export interface FromStep<T> extends TweenFromStep<T> {};
  export interface WithStep<T> extends TweenWithStep<T> {};
}
