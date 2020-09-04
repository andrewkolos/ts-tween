import { EventEmitter } from '@akolos/event-emitter';
import { Easings } from '../easing';
import { InterpolatorOpts } from './opts/opts';
import { DefaultableInterpolatorOpts } from './opts/defaultable-tween-opts';
import { Tweening, tweening } from './tweening';
import { DeepPartial } from '../deep-partial';
import { Timeline } from '../timeline';
import { InterpolatorToStep } from './builder/interpolator-to-step';
import { get as getBuilderStep } from './builder/get';
import { LazyTimer } from '../lazy-timer';
import { DeepReadonly } from '../misc/deep-readonly';
import { getNow } from '../misc/getNow';

interface InterpolatorEvents<T> {
  completed: (source: Interpolator<T>) => void;
  sought: (value: { from: number, to: number }, source: Interpolator<T>) => void;
  update: (value: T, source: Interpolator<T>) => void;
}

/**
 * When given a time, interpolates or "tweens" a value (or values in an object) towards another.
 * @template T The type of the value to be interpolated.
 */
export class Interpolator<T> extends EventEmitter<InterpolatorEvents<T>> implements Timeline {

  /**
   * Gets or sets default options for constructing future tweens.
   * @param [setValue] If not undefined, these properties will be copied into the default options.
   * @returns defaults The current default options.
   */
  public static defaults(setValue?: Partial<DefaultableInterpolatorOpts>):
    Readonly<Required<DefaultableInterpolatorOpts>> {

    if (setValue != null) {
      Object.assign(Interpolator.defaultOpts, setValue);
    }
    return this.defaultOpts;
  }

  private static defaultOpts: DefaultableInterpolatorOpts = {
    length: 1000,
    easing: Easings.easeOutQuad,
  };

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
  public constructor(target: T, tweenTo: DeepPartial<T>, opts: InterpolatorOpts) {
    super();
    this.tweenTo = tweenTo as DeepReadonly<DeepPartial<T>>;
    const completeOpts = fillMissingOptions(opts);
    this._target = target;
    this.tweening = tweening(target, tweenTo, completeOpts.easing);

    this.internalTimer = new LazyTimer(completeOpts.length);
    this.internalTimer
      .on('completed', () => this.emit('completed', this))
      .on('sought', ({ from, to }: { from: number, to: number }) => this.emit('sought', { from, to }, this))
      .on('update', () => {
        this._target = this.tweening(Math.min(this.localTime / this.length, 1.0));
        this.emit('update', this._target, this);
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
    return this.internalTimer.localTime;
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

export namespace Interpolator {
  /**
   * Begins the construction of a Interpolator, using the provided value as its target.
   * @param target The target of the tween (i.e. the value or to tween/interpolate).
   * @returns the next step in the building process, where the value to interpolate towards is given.
   */
  export function get<T>(target: T): InterpolatorToStep<T> {
    return getBuilderStep(target);
  }
}

function fillMissingOptions(opts: InterpolatorOpts): Required<InterpolatorOpts> {
  const defaults = Object.assign(InterpolatorOpts.clone(Interpolator.defaults()), { startTime: getNow() });
  const optsClone = InterpolatorOpts.clone(opts);
  return Object.assign(defaults, optsClone);
}
