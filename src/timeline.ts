export interface Timeline {
  seek(time: number): this;
  update(currentTime?: number): void;
  start(): this;
  stop(): this;
  readonly stopped: boolean;
  readonly length: number;
  readonly localTime: number;
}
