import { Timeline } from '../timeline/timeline';

export interface Sequenced<T extends Timeline> {
  startTime: number;
  timeline: T;
}
