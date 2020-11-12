import { DeepPartial } from '../deep-partial';
import { Easing } from '../easing';
import { TweenOptions } from './opts';
import { Tween } from './tween';
import { tween } from './tween-factory-func';

export class TweenBuilder {
  public constructor(private readonly opts: Partial<TweenOptions> = {}) { }

  public length(length: number) {
    return new TweenBuilder({ ...this.opts, length });
  }

  public easing(easing: Easing) {
    return new TweenBuilder({ ...this.opts, easing });
  }

  public tween<T>(target: T, propDests: DeepPartial<T>): Tween<T> {
    const missingOpts = findMissingTweenOptions(this.opts);
    if (missingOpts.length === 0) {
      return tween(target, propDests, this.opts as TweenOptions);
    } else {
      throw Error(`Required items are missing in tween builder: ${missingOpts.join(',')}.`)
    }
  }
}

function findMissingTweenOptions(opts: Partial<TweenOptions>): string[] {
  const asOpts = opts as TweenOptions;
  const missingItems: string[] = [];

  if (!asOpts.easing) missingItems.push('easing');
  if (!asOpts.length) missingItems.push('length');

  return missingItems;
}
