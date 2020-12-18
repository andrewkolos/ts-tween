import { Timeline } from '../timeline/timeline';
import { Sequence as SequenceClass, SequenceEvents as SequenceEventsInterface} from './sequence';

export * from './sequence-builder';

export type Sequence<T extends Timeline> = SequenceClass<T>;
export type SequenceEvents<T extends Timeline> = SequenceEventsInterface<T>;
