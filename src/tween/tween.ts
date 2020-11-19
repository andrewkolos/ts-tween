import { InheritableEventEmitter } from '@akolos/event-emitter';
import { TweenOptions } from './opts';
import { Tweening, tweening } from './tweening';
import { DeepPartial } from '../deep-partial';
import { Timeline, TimelineEvents } from '../timeline';
import { TweenToStep } from './step-builder/tween-to-step';
import { get as getBuilderStep } from './step-builder/get';
import { LazyTimer } from '../lazy-timer';
import { DeepReadonly } from '../misc/deep-readonly';
import { getNow } from '../misc/getNow';
import { TweenBuilder } from './tween-builder';
import { SequenceBuilder } from '../sequence';
import { Composite } from '../composite';

export interface TweenEvents<T> extends TimelineEvents<Tween<T>> {
  completed: [event: {}, source: Tween<T>];
  sought: [event: {from: number, to: number}, source: Tween<T>];
  updated: [event: {dt: number, value: T}, source: Tween<T>];
}

/**
 * When given a time, interpolates or "tweens" a value (or values in an object) towards another.
 * @template T The type of the value to be interpolated.
 */
export class Tween<T> extends InheritableEventEmitter<TweenEvents<T>> implements Timeline {

  private readonly internalTimer: LazyTimer;
  public readonly tweenTo: DeepReadonly<DeepPartial<T>>;
  private readonly tweening: Tweening<T>;
  private _target: T;

  /**
   * Creates a tween.
   * @param target The value to be interpolated. Will be written to whenever this tween is updated.
   * @param tweenTo The value to tween towards.
   * @param opts Describes how the target will be tweened.
   */
  public constructor(target: T, tweenTo: DeepPartial<T>, opts: TweenOptions) {
    super();
    this.tweenTo = tweenTo as DeepReadonly<DeepPartial<T>>;
    this._target = target;
    this.tweening = tweening(target, tweenTo, opts.easing);

    this.internalTimer = new LazyTimer(opts.length);
    this.internalTimer
      .on('completed', () => this.emit('completed', {}, this))
      .on('sought', ({from, to}: {from: number, to: number}) => this.emit('sought', {from, to}, this))
      .on('updated', (dt) => {
        this._target = this.tweening(Math.min(this.localTime / this.length, 1.0));
        this.emit('updated', {dt, value: this._target }, this);
      });
  }

  /**
   * The value being interpolated.
   */
  public get target(): T {
    return this._target;
  }

  /**
   * The length or duration of the interpolation.
   */
  public get length(): number {
    return this.internalTimer.length;
  }

  /**
   * The progress of the interpolation, in milliseconds.
   */
  public get localTime(): number {
    return this.internalTimer.time;
  }

  /**
   * Sets the local time (i.e. the progress of the interpolation, in milliseconds),
   * and then updates the value of the target.
   * @param time The local time (i.e. time from the start) to seek to, in the range [0, this.length].
   * @returns The tween, for method chaining.
   */
  public seek(time: number): this {
    this.internalTimer.seek(time);
    return this;
  }

  /**
   * Updates the tween to the current time, or, if another time is provided,
   * to that time.
   * @param [now] The time (since unix epoch) to seek to.
   */
  public update(now = getNow()): this {
    this.internalTimer.update(now);
    return this;
  }
}

// Need to use namespace instead of static methods on class as we do not expose
// the class to the outside world, only its type.
export namespace Tween {

  /**
   * Creates a tween.
   * @param target The value/object to tween.
   * @param propDests If the target is an object, an object containing the properties to tween
   *  and the values they should be tweened to.
   * @param opts The options for this tween, including the easing function to use and the
   *  length of the tween.
   */
  export function tween<T>(target: T, propDests: DeepPartial<T>, opts: TweenOptions) {
    return new Tween(target, propDests, opts);
  }

  /**
   * Creates a builder for a tween, providing an alternate syntax for creating tweens.
   * @param opts The options to preload the builder with, if any.
   */
  export function builder(opts: Partial<TweenOptions> = { }): TweenBuilder {
    return new TweenBuilder(opts);
  }

  /**
   * Begins the construction of a Tween, using the provided value as its target.
   * @param target The target of the tween (i.e. the value or to tween/interpolate).
   * @returns the next step in the building process, where the value to interpolate towards is given.
   */
  export function get<T>(target: T): TweenToStep<T> {
    return getBuilderStep(target);
  }

  /**
   * Creates a sequence of tweens (or more generally, timelines) that can be treated
   * and controlled as a single timeline.
   */
  export function sequence<T extends Timeline>(): SequenceBuilder<T> {
    return new SequenceBuilder();
  }

  /**
   * Creates a composite of timelines. Effectively groups timelines together so they can be
   * controlled together as if they were a single timeline.
   * @param timelines The timelines to place into this composite.
   */
  export function composite<T extends Timeline>(timelines: T[]): Composite<T> {
    return new Composite(timelines);
  }
}
