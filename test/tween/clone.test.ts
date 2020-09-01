import { cloneCommonProps } from '../../src/clone-common-props';
import { clone } from '../../src/clone';

describe(nameof(clone), () => {

  it('can clone immutable values', () => {
    const target1 = 1;
    const target2 = 'b';
    const target3 = false;

    expect(clone(target1)).toEqual(target1);
    expect(clone(target2)).toEqual(target2);
    expect(clone(target3)).toEqual(target3);
  })
  it('can clone flat, simple objects', () => {
    const target = {
      a: 1,
      b: '2',
    };

    const cloned = clone(target);

    expect(cloned).toEqual(target);
  });

  it('can clone deep objects', () => {
    const target = {
      a: 1,
      b: '2',
      c: {
        d: 4,
        e: [5, '6'],
      },
    };

    const cloned = clone(target);
    expect(cloned).toEqual(target);
  });

  it('errors when given a function to clone', () => {
    const target = () => 1;
    expect(() => clone(target)).toThrow();
  });
});

describe(nameof(cloneCommonProps), () => {

    it('works for immutable values of the same type', () => {
      expect(cloneCommonProps('left', 'right')).toEqual('left');
    });

    it('errors for immutable, different types', () => {
      expect(() => cloneCommonProps('left', 2 as any)).toThrow();
    });

    it('works for flat objects with identical shape', () => {
      const left = {
        a: 1,
        b: 2,
        c: 3,
      };

      const right = {
        a: 4,
        b: 5,
        c: 6,
      };

      expect(cloneCommonProps(left, right)).toEqual(left);
    });

    it('works for flat objects with differing shape', () => {
      const left = {
        a: 1,
        b: 2,
        c: 3,
        d: 4,
      };

      const right = {
        a: 5,
        b: 6,
      };

      expect(cloneCommonProps(left, right)).toEqual({
        a: 1,
        b: 2,
      });
    });

    it('works for deep objects', () => {
      const left = {
        a: 1,
        b: {
          c: 2,
          d: 3,
          e: [4, '5'],
        },
        f: [6, 7],
      };

      const right = {
        a: 1,
        b: {
          d: 2,
          e: [3, '5'],
        },
        f: [1, 2],
      };

      expect(cloneCommonProps(left, right)).toEqual({
        a: 1,
        b: {
          d: 3,
          e: [4, '5'],
        },
        f: [6, 7],
      });
    });
});
