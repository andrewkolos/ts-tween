import { Interpolator } from '../../src/interpolator';
import { Easings } from '../../src/easing/easings';
import { clone } from '../../src/clone';
import { cloneCommonProps } from '../../src/clone-common-props';

const linearOpts = { length: 1000, easing: Easings.linear };

describe(nameof(Interpolator), () => {
  it('correctly tweens numbers', (done) => {
    const start = 0;
    const end = 10;
    const tween = Interpolator.get(start).to(end).with(linearOpts)
      .on('update', (target: number) => {
        const progress = tween.localTime / tween.length;
        expect(target).toBeCloseTo(lerp(start, end, progress));
      })
      .on('completed', () => {
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

    const tween = Interpolator.get(cloneCommonProps(start, end)).to(end).with(linearOpts)
      .on('update', (value, source) => {
        const progress = source.localTime / source.length;
        expect(value.a).toBeCloseTo(lerp(start.a, end.a, progress));
      })
      .on('completed', () => done());

    completeTween(tween);
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

      const tween = Interpolator.get(start).to(end).withDefaults()
        .on('update', (value) => {
          expect(value).toBe(start);
        })
        .on('completed', () => done());
      completeTween(tween);
      expect(tween.target).toBe(start);
    });

  it('correctly tweens arrays', (done) => {
    const start = [1, 2, 3];
    const end = [10, 20, 30];
    const tween = Interpolator.get(clone(start)).to(end).with({ easing: Easings.linear })
      .on('update', (value) => {
        const progress = tween.localTime / tween.length;
        value.forEach((subVal, index) => {
          const subValExpected = lerp(start[index], end[index], progress);
          expect(subVal).toBeCloseTo(subValExpected);
        });
      })
      .on('completed', () => done());

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

    const tween = Interpolator.get(start).to(end).withDefaults()
      .on('completed', () => {
        expect(start).toEqual(end);
        expect(start.b).toBe(b);
        done();
      });

    completeTween(tween);
  });

  it('throws an error when the object to tween to contains a property missing in the target object', () => {
    expect(() => Interpolator.get({
      a: 1,
      b: 2,
    }).to({
      a: 3,
      d: 4,
    } as any)
      .overTime(1000)).toThrow();
  });

  it('updates properly when asked to seek to a specific time', () => {
    const start = 0;
    const end = 10;
    const tween = Interpolator.get(start).to(end).with(linearOpts);

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

function completeTween<T extends Interpolator<unknown>>(tween: T, intervalCount: number = 10): T {
  const startTime = new Date().getTime();
  for (let i = 1; i <= intervalCount; i++) {
    const timePerInterval = tween.length / intervalCount;
    const timeOfIthInterval = timePerInterval * i;
    tween.update(startTime + timeOfIthInterval);
  }
  return tween;
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}