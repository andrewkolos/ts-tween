import { EventEmitter } from '@akolos/event-emitter';
import { TweenOptions } from './opts';
import { Tweening, tweening } from './tweening';
import { DeepPartial } from '../deep-partial';
import { Timeline } from '../timeline/timeline';
import { TweenToStep } from './step-builder/tween-to-step';
import { get as getBuilderStep } from './step-builder/get';
import { DeepReadonly } from '../misc/deep-readonly';
import { TweenBuilder } from './tween-builder';
import { SequenceBuilder } from '../sequence';
import { Group } from '../group';
import { AbstractTimeline } from '../timeline/abstract-timeline';
import { TimelineEvents } from '../timeline';
import { makeTweenFactory, TweenFactory } from './tween-factory';

export interface TweenEvents<T> extends TimelineEvents<Tween<T>> {
  completed: [event: {}, source: Tween<T>];
  sought: [event: { from: number }, source: Tween<T>];
  updated: [event: { dt: number, value: T }, source: Tween<T>];
}

/**
 * When given a time, interpolates or "tweens" a value (or values in an object) towards another.
 * @template T The type of the value to be interpolated.
 */
export class Tween<T> extends AbstractTimeline implements Timeline {

  private readonly eventEmitter = new EventEmitter<TweenEvents<T>>();
  public readonly on = this.eventEmitter.makeDelegate('on', this);
  public readonly off = this.eventEmitter.makeDelegate('off', this);
  protected readonly emit = this.eventEmitter.makeDelegate('emit', this);

  public readonly tweenTo: DeepReadonly<DeepPartial<T>>;
  private tweening?: Tweening<T>;
  private _target: T;
  private readonly opts: TweenOptions;

  private constructor(target: T, tweenTo: DeepPartial<T>, opts: TweenOptions) {
    super(opts.length);
    this.tweenTo = tweenTo as DeepReadonly<DeepPartial<T>>;
    this._target = target;
    this.opts = opts;
  }

  /**
   * The value being interpolated.
   */
  public get target(): T {
    return this._target;
  }

  private captureTweening() {
    this.tweening = tweening(this.target, this.tweenTo, this.opts.easing);
  }

  protected _update(dt: number) {
    if (!this.tweening) {
      throw Error('This tween has no tweening function. This is likely an internal bug.');
    }
    this._target = this.tweening(Math.min(this.localTime / this.length, 1.0));
    this.emit('updated', { dt, value: this._target }, this);
  }

  protected _completed() {
    this.emit('completed', {}, this);
  }

  protected _start(): void {
    this.captureTweening();
    this.emit('started', {}, this);
  }

  protected _stop(): void {
    this.emit('stopped', {}, this);
  }

  protected _seek(from: number): void {
    this.emit('sought', { from }, this);
  }

  /**
   * Creates a tween.
   * @param target The value/object to tween.
   * @param propDests If the target is an object, an object containing the properties to tween
   *  and the values they should be tweened to.
   * @param opts The options for this tween, including the easing function to use and the
   *  length of the tween.
   */
  public static start<T>(target: T, tweenTo: DeepPartial<T>, opts: TweenOptions) {
    return new Tween(target, tweenTo, opts);
  }
}

// Need to use namespace instead of static methods on class as we do not expose
// the class to the outside world, only its type.
export namespace Tween {

  /**
   * Makes a factory that can produce tweens that share an easing and length.
   * @param opts The options that each tween will use.
   */
  export function factory(opts: TweenOptions): TweenFactory {
    return makeTweenFactory(opts);
  }

  /**
   * Creates a builder for a tween, providing an alternate syntax for creating tweens.
   * @param opts The options to preload the builder with, if any.
   */
  export function builder(opts: Partial<TweenOptions> = {}): TweenBuilder {
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
  export function group<T extends Timeline>(timelines: T[]): Group<T> {
    return new Group(timelines);
  }
}
