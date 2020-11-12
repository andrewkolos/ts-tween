import { Tween as TweenClass, TweenEvents as TweenEventsType } from './tween';

export * from './builder';
export * from './opts';

export type Tween<T> = TweenClass<T>;
export type TweenEvents<T> = TweenEventsType<T>;

export * from './tween-factory-func';
export * from './tween-factory';
