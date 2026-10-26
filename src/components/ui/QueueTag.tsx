import type { Queue } from '../../types/agent';

export function QueueTag({ queue }: { queue: Queue }) {
  return (
    <span className="inline-flex items-center rounded-md bg-navy-100 px-2 py-0.5 text-xs font-semibold text-navy-800">
      <span className="sr-only">Queue: </span>
      {queue}
    </span>
  );
}
