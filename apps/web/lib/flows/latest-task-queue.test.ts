import { describe, expect, it, vi } from "vitest";

import { LatestTaskQueue } from "./latest-task-queue";

function deferred<T>() {
  let reject!: (reason: unknown) => void;
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    reject = promiseReject;
    resolve = promiseResolve;
  });
  return { promise, reject, resolve };
}

describe("LatestTaskQueue", () => {
  it("never runs two tasks in parallel and coalesces pending input", async () => {
    const first = deferred<number>();
    const worker = vi
      .fn<(input: number) => Promise<number>>()
      .mockImplementationOnce(() => first.promise)
      .mockImplementation(async (input) => input);
    const queue = new LatestTaskQueue(worker);

    const firstResult = queue.enqueue(1);
    const stalePendingResult = queue.enqueue(2);
    const latestPendingResult = queue.enqueue(3);
    expect(worker).toHaveBeenCalledTimes(1);

    first.resolve(1);
    await expect(firstResult).resolves.toBe(1);
    await expect(stalePendingResult).resolves.toBe(3);
    await expect(latestPendingResult).resolves.toBe(3);
    expect(worker.mock.calls).toEqual([[1], [3]]);
    expect(queue.isIdle()).toBe(true);
  });

  it("halts after a failure and rejects work queued behind it", async () => {
    const first = deferred<number>();
    const failure = new Error("conflict");
    const worker = vi.fn<(input: number) => Promise<number>>(() => first.promise);
    const queue = new LatestTaskQueue(worker);

    const firstResult = queue.enqueue(1);
    const pendingResult = queue.enqueue(2);
    first.reject(failure);

    await expect(firstResult).rejects.toBe(failure);
    await expect(pendingResult).rejects.toBe(failure);
    await expect(queue.enqueue(3)).rejects.toBe(failure);
    expect(queue.isHalted()).toBe(true);
    expect(worker).toHaveBeenCalledTimes(1);
  });

  it("can retry after the failed task has settled", async () => {
    const worker = vi
      .fn<(input: number) => Promise<number>>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockImplementation(async (input) => input);
    const queue = new LatestTaskQueue(worker);

    await expect(queue.enqueue(1)).rejects.toThrow("offline");
    expect(queue.reset()).toBe(true);
    await expect(queue.enqueue(2)).resolves.toBe(2);
  });

  it("does not reset a task that is still running", async () => {
    const task = deferred<number>();
    const queue = new LatestTaskQueue(() => task.promise);
    const result = queue.enqueue(1);

    expect(queue.reset()).toBe(false);
    task.resolve(1);
    await expect(result).resolves.toBe(1);
  });
});
