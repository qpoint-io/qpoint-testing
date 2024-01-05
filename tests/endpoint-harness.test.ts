import { describe, it, expect, vi, afterEach } from 'vitest';
import { EndpointHarness } from '../src/endpoint-harness';
import { Queue } from '../src/queue';
import Endpoint, { Context } from '@qpoint/endpoint';

vi.mock('@qpoint/endpoint');
vi.mock('htmlrewriter');
vi.mock('./queue');

describe('EndpointHarness', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const harness = new EndpointHarness();
    expect(harness.endpoint).toBeInstanceOf(Endpoint);
    expect(harness.req).toBeInstanceOf(Request);
    expect(harness.queue).toBeInstanceOf(Queue);
    expect(harness.ctx).toBeDefined();
    expect(harness.reqCtx).toBeInstanceOf(Context);
  });

  it('should add middleware using use()', () => {
    const harness = new EndpointHarness();
    const middleware = vi.fn();
    harness.use(middleware);

    expect(middleware).not.toHaveBeenCalled(); // Middleware should not be called before fetch
  });

  it('should call waitUntil() and manage the queue on fetch', async () => {
    const harness = new EndpointHarness();
    const work = new Promise(resolve => setTimeout(resolve, 50));
    harness.ctx.waitUntil(work);

    expect(harness.queue.counter).toBe(1); // Counter should be incremented

    await work;
    expect(harness.queue.counter).toBe(0); // Counter should be decremented after work is done
  });

  it('should execute a function after queue is empty using onAfterComplete()', async () => {
    const harness = new EndpointHarness();
    const fn = vi.fn();
    await harness.onAfterComplete(fn);

    expect(fn).toHaveBeenCalledWith(harness.reqCtx);
  });
});
