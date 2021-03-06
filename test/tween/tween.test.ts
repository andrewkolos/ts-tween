import { Easings } from '../../src/easing/easings';
import { ManualTimelineRunnerStrategy, TimelineRunner } from '../../src/timeline-runner';
import { clone } from '../../src/tween/clone';
import { Tween } from '../../src/tween/tween';
import { makeTweenFactory } from '../../src/tween/tween-factory';
import { completeTimeline } from '../util';

beforeAll(() => TimelineRunner.changeStrategy(new ManualTimelineRunnerStrategy()));

const linearOpts = { length: 1000, easing: Easings.linear };

describe('Tween', () => {
  it('correctly tweens numbers', (done) => {
    const start = 0;
    const end = 10;
    const tween = Tween.get(start).to(end).with(linearOpts)
      .on('updated', (event) => {
        const progress = tween.localTime / tween.length;
        expect(event.value).toBeCloseTo(lerp(start, end, progress));
      })
      .on('completed', () => {
        done();
      });

    completeTimeline(tween);
  });

  it('correctly tweens flat objects', (done) => {
    const factory = makeTweenFactory(linearOpts);

    const start = {
      a: 1,
      b: 2,
    };

    const startClone = { ...start };

    const end = {
      a: 10,
    };

    const tween = factory(start, end)
      .on('updated', () => {
        const progress = tween.localTime / tween.length;
        expect(start.a).toBeCloseTo(lerp(startClone.a, end.a, progress));
      })
      .on('completed', () => done());

    completeTimeline(tween);
  });

  it('correctly preserves the identity of target, which should point object given to tween at construction time',
    (done) => {
      const start = {
        a: 1,
        b: 2,
      };

      const end = {
        a: 10,
      };

      const tween = Tween.builder()
        .easing(linearOpts.easing)
        .length(linearOpts.length)
        .tween(start, end)
        .on('updated', (event) => {
          expect(event.value).toBe(start);
        })
        .on('completed', () => done());
      completeTimeline(tween);
      expect(tween.target).toBe(start);
    });

  it('correctly tweens arrays', (done) => {
    const start = [1, 2, 3];
    const end = [10, 20, 30];
    const tween = Tween.get(clone(start)).to(end).with({ length: 1000, easing: Easings.linear })
      .on('updated', (event) => {
        const progress = tween.localTime / tween.length;
        event.value.forEach((subVal, index) => {
          const subValExpected = lerp(start[index], end[index], progress);
          expect(subVal).toBeCloseTo(subValExpected);
        });
      })
      .on('completed', () => done());

    completeTimeline(tween);
  });

  it('correctly tweens objects with depth = 2', (done) => {
    const b = { c: 2, d: 3 };
    const e = [4, 5];
    const start = {
      a: 1,
      b,
      e,
    };

    const end = {
      a: 10,
      b: {
        c: 20,
        d: 30,
      },
      e: [40, 50],
    };

    const tween = Tween.get(start).to(end).with(linearOpts)
      .on('completed', () => {
        expect(start).toEqual(end);
        expect(start.b).toBe(b);
        done();
      });

    completeTimeline(tween);
  });

  it('updates properly when asked to seek to a specific time', () => {
    const start = 0;
    const end = 10;
    const tween = Tween.get(start).to(end).with(linearOpts);

    tween.seek(tween.length / 10);
    expect(tween.target).toBeCloseTo(1);
    tween.seek(0);
    expect(tween.target).toBe(0);
    tween.seek(tween.length / 10 * 3);
    expect(tween.target).toBeCloseTo(3);
    tween.seek(-100);
    expect(tween.target).toBe(0);
    tween.seek(tween.length / 2);
    expect(tween.target).toBeCloseTo(5);
    tween.seek(tween.length + 1);
    expect(tween.target).toBe(10);
    tween.seek(tween.length / 2);
    expect(tween.target).toBeCloseTo(5);
  })
});

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}