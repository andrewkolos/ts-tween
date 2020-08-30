export interface Timeline {
  seek(time: number): this;
  start(): this;
  stop(): this;
  readonly length: number;
  readonly localTime: number;
}
