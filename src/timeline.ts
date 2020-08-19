export interface Timeline {
  seek(time: number): this;
  resume(): this;
  pause(): this;
  readonly length: number;
}
