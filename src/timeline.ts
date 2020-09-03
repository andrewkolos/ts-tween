export interface Timeline {
  seek(time: number): this;
  update(currentTime?: number): void;
  readonly length: number;
  readonly localTime: number;
}
