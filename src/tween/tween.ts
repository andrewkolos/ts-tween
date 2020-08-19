import { EventEmitter } from '@akolos/event-emitter';
import { Easings } from 'easing';
import { TweenOpts, cloneTweenOpts } from './opts';
import { Tweening, tweening } from './tweening';
import { DeepPartial } from 'deep-partial';
import { clone } from './clone-left-props-found-in-right';
import { Timeline } from 'timeline';
import { TweenToStep } from './builder/tween-to-step';
import { get } from './builder/get';

export interface TweenEvents<T> {
  update: (value: T, source: Tween<T>) => void;
  pause: (source: Tween<T>) => void;
  resume: (timeElapsedPaused: number, source: Tween<T>) => void;
  complete: (source: Tween<T>) => void;
}


export class Tween<T> extends EventEmitter<TweenEvents<T>> implements Timeline {

  public static get<T>(target: T): TweenToStep<T> {
    return get(target);
  }

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

  private readonly config: Required<TweenOpts>;
  private _localTime = 0;
  private timeOfLastUpdate?: number;
  private lastTimeResumed?: number;
  private _paused = false;
  private completed = false;
  public readonly tweenTo: DeepReadonly<DeepPartial<T>>;

  private readonly tweening: Tweening<T>;
  private _target: T;

  public timeOfCreation = new Date().getTime();

  public constructor(target: T, tweenTo: DeepPartial<T>, opts: TweenOpts) {
    super();
    this.tweenTo = tweenTo as DeepReadonly<DeepPartial<T>>;
    this.config = fillMissingOptions(opts);
    this._target = this.config.doNotWriteToSource ? clone(target) : target;
    this.tweening = tweening(target, tweenTo, this.config.easing, this.config.doNotWriteToSource);
  }

  public get paused(): boolean {
    return this._paused;
  }

  public get length(): number {
    return this.config.length;
  }

  public get localTime(): number {
    return this._localTime;
  }

  public get target(): T {
    return this._target;
  }

  public seek(time: number): this {
    this._localTime = time;
    if (time < this.length) this.completed = false;
    return this;
  }

  public resume(): this {
    if (this._paused) {
      this.emit('resume', calcTimeSpentPaused(this), this);
      this.lastTimeResumed = new Date().getTime();
    }

    this._paused = false;
    return this;

    function calcTimeSpentPaused(self: Tween<T>) {
      return self.lastTimeResumed == null ? 0 : self.lastTimeResumed;
    }
  }

  public pause(): this {
    if (!this._paused) {
      this._paused = true;
      this.emit('pause', this);
    }
    return this;
  }

  public update(currentTime = new Date().getTime()) {
    if (this.completed || this.paused) return;

    const elapsed = currentTime - timeOfLastUpdate(this);
    this._localTime = this._localTime + elapsed;

    this._target = this.tweening(Math.min(this._localTime / this.length, 1.0));
    this.emit('update', this._target, this);

    if (this._localTime >= this.length && !this.completed) {
      this.emit('complete', this);
      this.completed = true;
    }

    this.timeOfLastUpdate = currentTime;

    function timeOfLastUpdate(self: Tween<T>) {
      return self.timeOfLastUpdate == null ? self.timeOfCreation : self.timeOfLastUpdate;
    }
  }
}

function fillMissingOptions(opts: TweenOpts): Required<TweenOpts> {
  const defaultsClone = cloneTweenOpts(Tween.defaults());
  const optsClone = cloneTweenOpts(opts);
  return Object.assign(defaultsClone, optsClone);
}

type DeepReadonly<T> =
  T extends (infer R)[] ? DeepReadonlyArray<R> :
  T extends (...args: any) => void ? never :
  T extends object ? DeepReadonlyObject<T> :
  T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> { }

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};