import { Timeline } from 'timeline';
import Collections from 'typescript-collections';
import { Sequenced } from './sequenced-timeline';
import { Sequence } from './sequence';

export class SequenceBuilder<T extends Timeline> {

  private readonly items: Collections.BSTreeKV<{ startTime: number }, Sequenced<T>>;

  constructor() {
    this.items = new Collections.BSTreeKV((o1: Sequenced<T>, o2: Sequenced<T>) =>
      o1.startTime - o2.startTime);
  }

  /**
   * Adds a new timeline and makes it the last of the sequence.
   * @param timeline The timeline to add.
   * @param timeOffset How early (negative) or late (positive).
   * relative to the end of the previous timeline the new one should start.
   * If this is the first timeline being added the "previous timeline" is considered
   * to start and end at t=0. Also, the new timeline will be set to start at t=0 if
   * t_endOfPrevious + timeOffset < 0.
   */
  public append(timeline: T, timeOffset = 0): this {
    this.items.add({
      startTime: Math.max(this.items.maximum.length + timeOffset, 0),
      timeline,
    });
    return this;
  }

  public build(): Sequence<T> {
    return new Sequence(this.items.toArray());
  }

  public buildAndStart(): Sequence<T> {
    return this.build();
  }
}
