import { ReadonlyTimeline } from './readonly-timeline';


export interface TimelineEvents<Self = ReadonlyTimeline> {
  completed: [event: {}, source: Self];
  sought: [event: { from: number; }, source: Self];
  updated: [event: { dt: number; }, source: Self];
  started: [event: {}, source: Self];
  stopped: [event: {}, source: Self];
}
