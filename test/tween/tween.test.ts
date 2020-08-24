import { Tween } from '../../src/tween/tween';
import { Easings } from '../../src/easing/easings';

const linearNoWriteOpts = { length: 1000, easing: Easings.linear, doNotWriteToSource: true };

describe(nameof(Tween), () => {
  it('correctly tweens numbers', (done) => {
    const start = 0;
    const end = 10;
    const tween = Tween.get(start).to(end).with(linearNoWriteOpts)
      .on('update', (target: number) => {
        const progress = tween.localTime / tween.length;
        expect(target).toBeCloseTo(lerp(start, end, progress));
      })
      .on('complete', () => {
        done();
      });

    completeTween(tween);
  });

  it('correctly tweens flat objects', (done) => {
    const start = {
      a: 1,
      b: 2,
    };

    const end = {
      a: 10,
    };

    const tween = Tween.get(start).to(end).with(linearNoWriteOpts)
      .on('update', (value, source) => {
        const progress = source.localTime / source.length;
        expect(value.a).toBeCloseTo(lerp(start.a, end.a, progress));
        expect(value.b).toBe(start.b);
      })
      .on('complete', () => done());

    completeTween(tween);
  });

  it('correctly preserves target identity when not instructed to avoid writing updates to target', (done) => {
    const start = {
      a: 1,
      b: 2,
    };

    const end = {
      a: 10,
    };

    const tween = Tween.get(start).to(end).with({ doNotWriteToSource: false })
      .on('update', (value) => {
        expect(value).toBe(start);
      })
      .on('complete', () => done());
    completeTween(tween);
    expect(tween.target).toBe(start);
  });

  it('correctly tweens arrays', (done) => {
    const start = [1, 2, 3];
    const end = [10, 20, 30];
    const tween = Tween.get(start).to(end).with({ easing: Easings.linear, doNotWriteToSource: true })
      .on('update', (value) => {
        const progress = tween.localTime / tween.length;
        value.forEach((subVal, index) => {
          const subValExpected = lerp(start[index], end[index], progress);
          expect(subVal).toBeCloseTo(subValExpected);
        });
      })
      .on('complete', () => done());

    completeTween(tween);
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

    const tween = Tween.get(start).to(end).withDefaults()
      .on('complete', () => {
        expect(start).toEqual(end);
        expect(start.b).toBe(b);
        done();
      });

    completeTween(tween);
  });

  it('throws an error when the object to tween to contains a property missing in the target object', () => {
    expect(() => Tween.get({
      a: 1,
      b: 2,
    }).to({
      a: 3,
      d: 4,
    } as any)
      .overTime(1000)).toThrow();
  });
});

function completeTween<T extends Tween<unknown>>(tween: T, intervalCount: number = 10): T {
  for (let i = 1; i <= intervalCount; i++) {
    const timePerInterval = tween.length / intervalCount;
    const timeOfIthInterval = timePerInterval * i;
    tween.update(tween.startTime + timeOfIthInterval);
  }
  return tween;
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}