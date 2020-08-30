import { EventEmitter } from '@akolos/event-emitter';
import { Easings } from 'easing';
import { TweenOpts, cloneTweenOpts } from './opts';
import { Tweening, tweening } from './tweening';
import { DeepPartial } from 'deep-partial';
import { clone } from './clone-left-props-found-in-right';
import { Timeline } from 'timeline';
import { TweenToStep } from './builder/tween-to-step';
import { get as getBuilderStep } from './builder/get';
import { LazyTimer } from 'lazy-timer';
import { DeepReadonly } from '../misc/deep-readonly';
import { getNow } from 'misc/getNow';

interface TweenEvents<T> {
  complete: (source: Tween<T>) => void;
  pause: (source: Tween<T>) => void;
  resume: (source: Tween<T>) => void;
  seek: (from: number, to: number, source: Tween<T>) => void;
  update: (value: T, source: Tween<T>) => void;
}


export class Tween<T> extends EventEmitter<TweenEvents<T>> implements Timeline {

  public static defaults(setValue?: Partial<TweenOpts>): Readonly<Required<TweenOpts>> {
    if (setValue != null) {
      Object.assign(Tween.defaultOpts, setValue);
    }
    return this.defaultOpts;
  }

  private static defaultOpts: Required<TweenOpts> = {
    length: 1000,
    easing: Easings.easeOutQuad,
    doNotWriteToSource: false,
  };

  private readonly internalTimer: LazyTimer;
  public readonly tweenTo: DeepReadonly<DeepPartial<T>>;
  private readonly tweening: Tweening<T>;
  private _target: T;

  public constructor(target: T, tweenTo: DeepPartial<T>, opts: TweenOpts) {
    super();
    this.tweenTo = tweenTo as DeepReadonly<DeepPartial<T>>;
    const completeOpts = fillMissingOptions(opts);
    this._target = completeOpts.doNotWriteToSource ? clone(target) : target;
    this.tweening = tweening(target, tweenTo, completeOpts.easing, completeOpts.doNotWriteToSource);

    this.internalTimer = new LazyTimer(completeOpts.length);
    this.internalTimer.on('start', () => this.emit('resume', this))
      .on('complete', () => this.emit('complete', this))
      .on('stop', () => this.emit('pause', this))
      .on('seek', (from, to) => this.emit('seek', from, to, this))
      .on('update', () => {
        this._target = this.tweening(Math.min(this.localTime / this.length, 1.0));
        this.emit('update', this._target, this);
      });
  }

  public get target(): T {
    return this._target;
  }

  public get paused(): boolean {
    return this.internalTimer.paused;
  }

  public get length(): number {
    return this.internalTimer.length;
  }

  public get localTime(): number {
    return this.internalTimer.localTime;
  }

  public seek(time: number): this {
    this.internalTimer.seek(time);
    return this;
  }

  public start(): this {
    this.internalTimer.start();
    return this;
  }

  public stop(): this {
    this.internalTimer.stop();
    return this;
  }

  public update(now = getNow()) {
    this.internalTimer.update(now);
  }
}

export namespace Tween {
  export function get<T>(target: T): TweenToStep<T> {
    return getBuilderStep(target);
  }
}

function fillMissingOptions(opts: TweenOpts): Required<TweenOpts> {
  const defaultsClone = cloneTweenOpts(Tween.defaults());
  const optsClone = cloneTweenOpts(opts);
  return Object.assign(defaultsClone, optsClone);
}
