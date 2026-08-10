type TaskWaiter<Output> = Readonly<{
  reject: (reason: unknown) => void;
  resolve: (value: Output) => void;
}>;

type PendingTask<Input, Output> = {
  input: Input;
  waiters: TaskWaiter<Output>[];
};

export class LatestTaskQueue<Input, Output> {
  private haltedReason: unknown = null;
  private pending: PendingTask<Input, Output> | null = null;
  private running = false;

  constructor(private readonly worker: (input: Input) => Promise<Output>) {}

  enqueue(input: Input): Promise<Output> {
    if (this.haltedReason !== null) {
      return Promise.reject(this.haltedReason);
    }

    const promise = new Promise<Output>((resolve, reject) => {
      if (this.pending) {
        this.pending.input = input;
        this.pending.waiters.push({ reject, resolve });
      } else {
        this.pending = { input, waiters: [{ reject, resolve }] };
      }
    });

    if (!this.running) void this.drain();
    return promise;
  }

  isHalted(): boolean {
    return this.haltedReason !== null;
  }

  isIdle(): boolean {
    return !this.running && this.pending === null;
  }

  reset(): boolean {
    if (this.running) return false;
    this.haltedReason = null;
    return true;
  }

  private async drain(): Promise<void> {
    this.running = true;
    while (this.pending) {
      const task = this.pending;
      this.pending = null;
      try {
        const output = await this.worker(task.input);
        for (const waiter of task.waiters) waiter.resolve(output);
      } catch (error) {
        this.haltedReason = error;
        for (const waiter of task.waiters) waiter.reject(error);
        this.rejectPending(error);
      }
    }
    this.running = false;
  }

  private rejectPending(error: unknown): void {
    const pending = this.pending;
    if (!pending) return;
    for (const waiter of pending.waiters) waiter.reject(error);
    this.pending = null;
  }
}
