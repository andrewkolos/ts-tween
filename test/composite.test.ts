import { Composite } from '../src/composite';
import { Tween } from '../src/tween/tween';
import { completeTimeline, lerp, makeZeroToOneTween, progressOf } from './util';

describe(nameof(Composite), () => {
  it('Updates all items correctly when running start to finish.', (done) => {
    const items = new Array(3).map(() => makeZeroToOneTween());
    const comp = Tween.composite(items);
    comp.on('updated', () => {
      items.forEach(i => expect(i.target).toBeCloseTo(lerp(0, 1, progressOf(i))));
    });
    comp.on('completed', () => {
      items.forEach(i => {
        expect(i.target).toEqual(1);
        expect(i.localTime).toEqual(i.length);
      });
      done();
    });
    completeTimeline(comp);
  });

  it('Seeks properly', () => {
    const soughtListener = jest.fn();
    const completedListener = jest.fn();
    const updatedListener = jest.fn();
    const tween = makeZeroToOneTween();
    const comp = Tween.composite([tween]);
    comp.on('sought', soughtListener)
      .on('updated', updatedListener)
      .on('completed', completedListener);

    comp.seek(comp.length / 10);
    expect(tween.target).toBeCloseTo(0.1);
    comp.seek(0);
    expect(tween.target).toBe(0);
    comp.seek(comp.length / 10 * 3);
    expect(tween.target).toBeCloseTo(0.3);
    comp.seek(-100);
    expect(tween.target).toBe(0);
    comp.seek(comp.length / 2);
    expect(tween.target).toBeCloseTo(0.5);
    comp.seek(comp.length + 1);
    expect(tween.target).toBe(1);
    comp.seek(comp.length / 2);
    expect(tween.target).toBeCloseTo(0.5);

    const seekCount = 7;
    expect(soughtListener).toHaveBeenCalledTimes(seekCount);
    expect(updatedListener).toHaveBeenCalledTimes(seekCount);
    expect(completedListener).toHaveBeenCalledTimes(1);
  });
});

