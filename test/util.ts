import { Easings } from '../src/easing';
import { Timeline } from '../src/timeline';
import { Tween } from '../src/tween/tween';

export function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

export function progressOf(timeline: Timeline) { return timeline.localTime / timeline.length };

export function makeZeroToOneTween() {
  return Tween.get(0).to(1).with({
    easing: Easings.linear,
    length: 1000,
  });
};

export function completeTimeline<T extends Timeline>(timeline: T, intervalCount: number = 10): T {
  for (let i = 1; i <= intervalCount; i++) {
    const timePerInterval = timeline.length / intervalCount;
    timeline.__update(timePerInterval);
  }
  return timeline;
}