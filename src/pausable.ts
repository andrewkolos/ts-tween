
export interface Pausable {
  readonly paused: boolean;
  pause(): void;
  resume(): void;
}
