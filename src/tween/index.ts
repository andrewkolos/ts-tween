import { Tween as TweenClass, TweenEvents as TweenEventsType } from './tween';
import { TweenBuilder as TweenBuilderClass } from './tween-builder';

export * from './step-builder';
export * from './opts';

export type Tween<T> = TweenClass<T>;
export type TweenEvents<T> = TweenEventsType<T>;

export * from './tween-factory-func';
export * from './tween-factory';

export type TweenBuilder = TweenBuilderClass;
