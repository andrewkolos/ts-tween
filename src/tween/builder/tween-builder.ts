import { Tween } from '../tween';
import { TweenOpts } from '../opts';
import { TweenFromStep } from './tween-from-step';
import { TweenToStep } from './tween-to-step';
import { TweenWithStep } from './tween-with-step';

export class TweenBuilder<T> implements TweenFromStep<T>, TweenToStep<T>, TweenWithStep<T> {
  private target?: T;
  private destination?: Partial<T>;

  public get(target: T): TweenToStep<T> {
    this.target = target;
    return this;
  }

  public to(destination: Partial<T>): TweenWithStep<T> {
    this.destination = destination;
    return this;
  }

  public withDefaults(): Tween<T> {
    if (this.target == null || this.destination == null) {
      throw Error('Missing information required to create Tween.');
    }
    return new Tween(this.target, this.destination, Tween.defaults());
  }

  public with(options: TweenOpts): Tween<T> {
    if (this.target == null || this.destination == null) {
      throw Error('Missing information required to create Tween.');
    }
    return new Tween(this.target, this.destination, options);
  }

  public overTime(length: number): Tween<T> {
    if (this.target == null || this.destination == null) {
      throw Error('Missing information required to create Tween.');
    }
    return new Tween(this.target, this.destination, { length });
  }
}
