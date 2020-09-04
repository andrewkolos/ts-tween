import { SequenceBuilder } from '../../src/sequence/sequence-builder';
import { Sequenced } from '../../src/sequence';
import { Interpolator } from '../../src/interpolator';

describe(nameof(SequenceBuilder), () => {
  it('correctly builds a sequence of timelines made with 0-offset appends', () => {
    const one = Interpolator.get(0).to(1).overTime(1000);
    const two = Interpolator.get(2).to(3).overTime(1000);
    const sequence = new SequenceBuilder<Interpolator<number>>()
      .append(one).append(two).build();
    expect(sequence.getItems()).toEqual<Sequenced<Interpolator<number>>[]>([
      {
        startTime: 0,
        timeline: one
      },
      {
        startTime: 1000,
        timeline: two
      }
    ]);
  });

  it('correctly builds a sequence of timelines with offsetted appends', () => {
    const one = Interpolator.get(0).to(1).overTime(1000);
    const two = Interpolator.get(2).to(3).overTime(1000);
    const three = Interpolator.get(4).to(5).overTime(1000);
    const sequence = new SequenceBuilder<Interpolator<number>>()
      .append(one, -500).append(two, 500).append(three, -800).build();
    expect(sequence.getItems()).toEqual<Sequenced<Interpolator<number>>[]>([
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