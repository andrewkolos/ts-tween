import { SequenceBuilder } from '../../src/sequence/sequence-builder';
import { Tween } from '../../src/tween/tween';
import { TweenOptions } from '../../src/tween/opts';
import { Easings } from '../../src/easing';
import { ManualTimelineRunnerStrategy, TimelineRunner } from '../../src/timeline-runner';
import { Sequenced } from '../../src/sequence/sequenced-timeline';

beforeAll(() => TimelineRunner.changeStrategy(new ManualTimelineRunnerStrategy()));

const linearOpts: TweenOptions = {
  easing: Easings.linear,
  length: 1000,
}

describe('SequenceBuilder', () => {
  it('correctly builds a sequence of timelines made with 0-offset appends', () => {
    const one = Tween.get(0).to(1).with(linearOpts);
    const two = Tween.get(2).to(3).with(linearOpts);
    const three = Tween.get(3).to(4).with(linearOpts);
    const sequence = new SequenceBuilder<Tween<number>>()
      .append(one).append(two).append(three).start();
    expect(sequence.getItems()).toEqual<Sequenced<Tween<number>>[]>([
      {
        startTime: 0,
        timeline: one,
      },
      {
        startTime: 1000,
        timeline: two,
      },
      {
        startTime: 2000,
        timeline: three,
      }
    ]);
  });

  it('correctly builds a sequence of timelines with offsetted appends', () => {
    const one = Tween.get(0).to(1).with(linearOpts)
    const two = Tween.get(2).to(3).with(linearOpts)
    const three = Tween.get(4).to(5).with(linearOpts)
    const sequence = new SequenceBuilder<Tween<number>>()
      .append(one, -500).append(two, 500).append(three, -800).start();
    expect(sequence.getItems()).toEqual<Sequenced<Tween<number>>[]>([
      {
        startTime: 0,
        timeline: one,
      },
      {
        startTime: 1500,
        timeline: two,
      },
      {
        startTime: 2500 - 800,
        timeline: three,
      },
    ]);
  });
});