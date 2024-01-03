import { describe, it, expect } from 'vitest';
import { Queue } from '../src/queue';

describe('Queue', () => {
  it('should start with a counter of 0', () => {
    const queue = new Queue();
    expect(queue.counter).toBe(0);
  });

  it('should increment the counter', () => {
    const queue = new Queue();
    queue.increment();
    expect(queue.counter).toBe(1);
  });

  it('should decrement the counter', () => {
    const queue = new Queue();
    queue.increment();
    queue.decrement();
    expect(queue.counter).toBe(0);
  });

  it('should not decrement the counter below 0', () => {
    const queue = new Queue();
    queue.decrement();
    expect(queue.counter).toBe(0);
  });

  it('should resolve allComplete immediately if no tasks are queued', async () => {
    const queue = new Queue();
    await expect(queue.allComplete()).resolves.toBeUndefined();
  });

  it('should resolve allComplete after all tasks are completed', async () => {
    const queue = new Queue();
    queue.increment();
    setTimeout(() => queue.decrement(), 50);

    await expect(queue.allComplete()).resolves.toBeUndefined();
  });

  it('should call all callbacks once when counter reaches zero', async () => {
    const queue = new Queue();
    let callbackCalled = 0;

    const callback = (): void => {
      callbackCalled++;
    };

    queue.increment();
    queue.callbacks.push(callback);

    setTimeout(() => queue.decrement(), 50);

    await queue.allComplete();
    expect(callbackCalled).toBe(1);
  });
});
