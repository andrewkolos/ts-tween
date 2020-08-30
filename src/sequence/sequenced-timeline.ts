import { Timeline } from 'timeline';

export interface Sequenced<T extends Timeline> {
  startTime: number;
  timeline: T;
}
