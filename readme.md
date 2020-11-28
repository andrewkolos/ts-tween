# ts-tween

A JavaScript tweening library written in TypeScript. Requires TS version >= 4.0.

## Example usage

### Creating a Tween
There are a few ways to create a Tween.

The `tween` factory function.
```ts
import { tween, Tween, Easings } from '@akolos/ts-tween';

const point = {
  x: 0,
  y: 0,
};

const target = {
  x: 10,
}

// Moves the x-coordinate to 10 over one second in a linear fashion.
const xTween = tween(point, target, {easing: Easings.linear, length: 1000});

// Also available as a static method on `Tween`
const yTween = Tween.start(point, {y: 10}, {easing: Easings.linear, length: 1000});
```

The step-builder methods.

```ts
const myTween = Tween.get(point).to(target).with({easing: Easings.linear, length: 1000});
```

Creating a factory (useful when many of your tweens will have the same easing/length).
```ts
const pointTweenFactory = Tween.factory({ easing: Easings.easeOutCubic, length: 1000 });

const xTween = pointTweenFactory(point, { x: 10 });
const yTween = pointTweenFactory(point, { y: 5 });
```

A traditional builder.
```ts
const tween = Tween.builder()
  .easing(Easings.linear)
  .length(1000)
  .tween(point, {x: 5, y: 5});
```

### Composite Tweens

#### Groups
A group is a collection of multiple tweens that can be treated as one.
```ts
const xTween = Tween.tween(point, target, { easing: Easings.linear, length: 1000 });
const yTween = Tween.tween(point, { y: 10 }, { easing: Easings.linear, length: 1000 });

const xAndYTween = Tween.group([xTween, yTween]);
xAndYTween.seek(500);
```

#### Sequences
A sequence is an ordered group of tweens, where each tween has its own specified starting time.
```ts
// Tweens x first, then tweens y.
const sequence = Tween.sequence()
  .append(xTween)
  .append(yTween)
  .start();
```

## License - MIT

Copyright 2020 Andrew Kolos

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.