import { Pausable } from './pausable';
import { DeltaStopwatch } from './delta-stopwatch';

export class PausableDeltaStopwatch implements Pausable {
  private stopwatch = new DeltaStopwatch();


  private _paused = false;


  public get paused(): boolean {
    return this._paused;
  }


  public resume(): void {
    if (this._paused) {
      this._paused = false;
    }
  }


  public pause(): void {
    if (!this._paused) {
      this._paused = true;
    }
  }


  public reset() {
    this.stopwatch.reset();
  }


  public next(): number {
    return this.stopwatch.next();
  }
}
