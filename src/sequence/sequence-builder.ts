import { Timeline } from '../timeline/timeline';
import { Sequenced } from './sequenced-timeline';
import { Sequence } from './sequence';

export class SequenceBuilder<T extends Timeline> {

  private latestEndTime = 0;
  private readonly items: Sequenced<Timeline>[] = [];

  /**
   * Adds a new timeline and makes it the last of the sequence.
   * @param timeline The timeline to add.
   * @param timeOffset How early (negative) or late (positive).
   * relative to the end of the previous timeline the new one should start.
   * If this is the first timeline being added the "previous timeline" is considered
   * to start and end at t=0. Also, the new timeline will be set to start at t=0 if
   * t_endOfPrevious + timeOffset < 0.
   */
  public append<Tn extends Timeline>(timeline: Tn, timeOffset = 0): SequenceBuilder<T | Tn> {
    const startTime = Math.max(this.latestEndTime + timeOffset, 0);
    this.items.push({
      startTime: Math.max(startTime, 0),
      timeline,
    });
    this.latestEndTime = Math.max(this.latestEndTime, startTime + timeline.length);
    return this;
  }

  /**
   * Builds the sequence and starts it.
   * @returns The sequence.
   */
  public start(): Sequence<T> {
    return new Sequence(this.items as Sequenced<T>[]);
  }
}
