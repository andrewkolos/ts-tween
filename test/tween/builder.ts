import { Easings } from '../../src/easing';
import { Tween } from '../../src/tween/tween';
import { TweenBuilder } from '../../src/tween/tween-builder';

describe(nameof(TweenBuilder), () => {
  describe('throws an error when required options are not given', () => {
    it('length is missing', () => {
      expect(() => Tween.builder().easing(Easings.linear).tween<number>(1, 2)).toThrow();
    });

    it('easing is missing', () => {
      expect(() => Tween.builder().length(100).tween<number>(1, 2)).toThrow();
    });

    it('multiple are missing', () => {
      expect(() => Tween.builder().tween<number>(1, 2));
    });
  });
});
