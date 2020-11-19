import { Sequence } from '../../src/sequence/sequence';
import { Sequenced } from '../../src/sequence';
import { Tween } from '../../src/tween/tween';
import { Timeline } from '../../src/timeline';
import { makeZeroToOneTween } from '../util';

function assignStartTimes<T extends Timeline>(times: number[], timelines: T[]): Sequenced<T>[] {
  if (times.length !== timelines.length) {
    throw Error('Number of start times and timelines to sequence are not equal.');
  }

  return times.map((value, index) => ({ startTime: value, timeline: timelines[index] }));
}

describe(nameof(Sequence), () => {
  it('correctly plays out a single item', (done) => {
    const tweenZeroToOne = makeZeroToOneTween();
    const seq = new Sequence(assignStartTimes([0], [tweenZeroToOne]))
      .on('updated', () => {
        expect(tweenZeroToOne.target).toBeCloseTo(lerp(0, 1, progressOf(seq)));
        expect(tweenZeroToOne.target).toBeCloseTo(lerp(0, 1, progressOf(tweenZeroToOne)));
      })
      .on('completed', () => done());

    completeSequence(seq);
  });

  it('correctly plays out multiple sequenced items from start to finish', () => {
    const one = makeZeroToOneTween();
    const two = makeZeroToOneTween();
    const three = makeZeroToOneTween();
    const four = makeZeroToOneTween();
    const sequence = new Sequence([
      {
        startTime: 0,
        timeline: one,
      },
      {
        startTime: 500,
        timeline: two,
      },
      {
        startTime: 1000,
        timeline: three,
      },
      {
        startTime: 1499,
        timeline: four,
      }
    ]);
    const completedHandler = jest.fn();
    sequence.on('completed', completedHandler);

    testLocalTimes([0, 0, 0, 0]);
    sequence.seek(500);
    testLocalTimes([500, 0, 0, 0]);
    sequence.seek(1001);
    testLocalTimes([1000, 501, 1, 0]);
    sequence.seek(1500);
    testLocalTimes([1000, 1000, 500, 1]);
    sequence.seek(2000);
    testLocalTimes([1000, 1000, 1000, 501]);
    sequence.seek(2499);
    testLocalTimes([1000, 1000, 1000, 1000]);

    expect(completedHandler).toBeCalledTimes(1);

    function testLocalTimes(expectedLocalTimes: [number, number, number, number]) {
      [one, two, three, four].forEach((item, index) => expect(item.localTime).toBe(expectedLocalTimes[index]));
    }
  });

  it('correctly maintains its list of active timelines', () => {
    const one = makeZeroToOneTween();
    const two = makeZeroToOneTween();
    const three = makeZeroToOneTween();
    const four = makeZeroToOneTween();
    const sequence = new Sequence([
      {
        startTime: 0,
        timeline: one,
      },
      {
        startTime: 500,
        timeline: two,
      },
      {
        startTime: 1000,
        timeline: three,
      },
      {
        startTime: 1499,
        timeline: four,
      }
    ]);

    testActiveTimelinesHaving([]);
    sequence.seek(0);
    testActiveTimelinesHaving([one]);
    sequence.seek(500);
    testActiveTimelinesHaving([one, two]);
    sequence.seek(1001);
    testActiveTimelinesHaving([two, three]);
    sequence.seek(1500);
    testActiveTimelinesHaving([three, four]);
    sequence.seek(2000);
    testActiveTimelinesHaving([four]);
    sequence.seek(2500);
    testActiveTimelinesHaving([]);

    function testActiveTimelinesHaving(tweens: Tween<number>[]) {
      expect(sequence.getActiveTimelines().size).toBe(tweens.length);
      expect(tweens.every(t => sequence.getActiveTimelines().has(t)));
    }
  });

  it('correctly handles seeking backwards', () => {
    const one = makeZeroToOneTween();
    const two = makeZeroToOneTween();
    const sequence = new Sequence([
      {
        startTime: 0,
        timeline: one,
      },
      {
        startTime: 500,
        timeline: two,
      },
    ]);

    sequence.seek(1000);
    sequence.seek(500);
    expect(one.localTime).toBe(500);
    expect(two.localTime).toBe(0);
    expect(sequence.getActiveTimelines().has(one)).toBe(true);
    expect(sequence.getActiveTimelines().has(two)).toBe(true);
  });

  it('correctly fires timeline activation/deactivation events when playing normally', () => {
    const one = makeZeroToOneTween();
    const two = makeZeroToOneTween();
    const three = makeZeroToOneTween();
    const sequence = new Sequence([
      {
        startTime: 0,
        timeline: one,
      },
      {
        startTime: 500,
        timeline: two,
      },
      {
        startTime: 1000,
        timeline: three,
      },
    ]);

    const tests: { test: () => void }[] = [];

    const testOneActivating = addActiveListenerFor(one);
    const testNoDeactivationUntilOneEnds = addDeactiveListenerFor(null);
    sequence.seek(0);
    testOneActivating.test();
    const testNoActivationUntilTwo = addActiveListenerFor(null);
    sequence.seek(499);
    testNoActivationUntilTwo.test();
    const testTwoActivating = addActiveListenerFor(two);
    sequence.seek(500);
    testTwoActivating.test();
    sequence.seek(999);
    testNoDeactivationUntilOneEnds.test();
    const testOneDeactivating = addDeactiveListenerFor(one);
    const testThreeActivating = addActiveListenerFor(three);
    sequence.seek(1000);
    testOneDeactivating.test();
    testThreeActivating.test();
    const testTwoDeactivating = addDeactiveListenerFor(two);
    sequence.seek(1500);
    testTwoDeactivating.test();
    const testThreeDeactivating = addDeactiveListenerFor(three);
    sequence.seek(2000);
    testThreeDeactivating.test();

    tests.forEach((t => t.test()));

    function addActiveToggleListenerFor(tween: Tween<number> | null,
      eventName: 'timelineActivated' | 'timelineDeactivated') {
      let alreadyRemovedCb = false;
      const cb = jest.fn() as () => void;
      sequence.on(eventName, cb as any);
      const test = {
        test: () => {
          expect(cb).toBeCalledTimes(tween == null ? 0 : 1);
          if (tween != null)
            expect(cb).toBeCalledWith(tween, sequence);
          if (!alreadyRemovedCb) sequence.off(eventName, cb);
          alreadyRemovedCb = true;
        }
      }
      tests.push(test);
      return test;
    }

    function addActiveListenerFor(tween: Tween<number> | null) {
      return addActiveToggleListenerFor(tween, 'timelineActivated');
    }
    function addDeactiveListenerFor(tween: Tween<number> | null) {
      return addActiveToggleListenerFor(tween, 'timelineDeactivated');
    }
  });

  it('correctly fires timeline activation/deactivation events when seeking backwards or far forwards', () => {
    const one = makeZeroToOneTween();
    const two = makeZeroToOneTween();
    const three = makeZeroToOneTween();
    const sequence = new Sequence([
      {
        startTime: 0,
        timeline: one,
      },
      {
        startTime: 500,
        timeline: two,
      },
      {
        startTime: 1600,
        timeline: three,
      },
    ]);

    const testOneActivating = addActiveListenerFor(one);
    const testTwoActivating = addActiveListenerFor(two);
    const testThreeActivating = addActiveListenerFor(three);
    const testOneDeactivating = addDeactiveListenerFor(one);
    const testTwoDeactivating = addDeactiveListenerFor(two);
    const testThreeDeactivating = addDeactiveListenerFor(three);

    sequence.seek(1500);
    testTwoActivating();
    sequence.seek(0);
    testOneActivating();
    testTwoDeactivating();
    sequence.seek(500000);
    testThreeActivating();
    testOneDeactivating();
    sequence.seek(400);
    testThreeDeactivating();
    testOneActivating();
    sequence.seek(1700);
    testOneDeactivating();
    testThreeActivating();
    sequence.seek(2600);
    testThreeDeactivating();
    sequence.seek(2601);

    function addActiveToggleListenerFor(tween: Tween<number>, eventName: 'timelineActivated' | 'timelineDeactivated') {
      let matchCounter = 0;
      let counter = 0;
      const cb = jest.fn((eventTween: Tween<number>) => { if (tween === eventTween) matchCounter++ });
      sequence.on(eventName, cb as any);
      return () => {
        expect(matchCounter).toBe(++counter);
      }
    }

    function addActiveListenerFor(tween: Tween<number>) {
      return addActiveToggleListenerFor(tween, 'timelineActivated');
    }
    function addDeactiveListenerFor(tween: Tween<number>) {
      return addActiveToggleListenerFor(tween, 'timelineDeactivated');
    }
  });
});

function completeSequence<T extends Sequence<any>>(sequence: T, intervalCount: number = 10): T {
  for (let i = 1; i <= intervalCount; i++) {
    const timePerInterval = sequence.length / intervalCount;
    const timeOfIthInterval = timePerInterval * i;
    sequence.seek(timeOfIthInterval);
  }
  return sequence;
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function progressOf(timeline: Timeline) { return timeline.localTime / timeline.length };