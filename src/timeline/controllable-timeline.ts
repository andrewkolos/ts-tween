import { Pausable } from '../pausable';
import { Seekable } from '../seekable';
import { Updateable } from '../updateable';
import { PausableDeltaStopwatch } from '../pausable-delta-stopwatch';
import { Timeline } from './timeline';

export class ControllableTimeline implements Timeline, Seekable, Pausable, Updateable {
  private stopwatch = new PausableDeltaStopwatch();


  private _localTime: number = 0;


  public constructor(readonly length: number) { }


  public get paused() {
    return this.stopwatch.paused;
  }


  public get localTime(): number {
    return this._localTime;
  }


  public resume(): void {
    this.stopwatch.resume();
  }


  public pause(): void {
    this.stopwatch.pause();
  }


  public seek(time: number): void {
    this._localTime = time;
    this.stopwatch.reset();
  }


  public update(): void {
    this._localTime = this._localTime + this.stopwatch.next();
  }
}
