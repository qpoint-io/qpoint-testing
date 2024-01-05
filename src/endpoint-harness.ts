import Router, { Context } from '@qpoint/router';
import { Queue } from './queue';
import '@qpoint/htmlrewriter';

/**
 * The `EndpointHarness` class is designed for testing Qpoint middleware. It features a router
 * instance from '@qpoint/router' to route requests and a queue to track and manage background
 * asynchronous tasks, ensuring their completion before moving forward.
 *
 * The class's primary functionalities include adding middleware using the `use()` method,
 * executing the middleware stack with the `fetch` method (note: this does not make actual HTTP calls),
 * and a mechanism to wait for all tasks in the queue to complete via the `onAfterComplete` method.
 *
 * Example Usage:
 * ```
 *    const endpoint = new EndpointHarness();
 *
 *    // Add middleware
 *    endpoint.use(yourMiddlewareFunction);
 *
 *    // Execute middleware without making actual HTTP calls
 *    await endpoint.fetch();
 *
 *    // Actions to perform after all tasks are complete
 *    await endpoint.onAfterComplete((ctx: Context) => {
 *      // Validate context changes made by the middleware
 *    });
 * ```
 */
export class EndpointHarness {
  endpoint: Router;
  req: Request;
  ctx: ExecutionContext;
  queue: Queue;
  reqCtx: Context;

  constructor() {
    this.endpoint = new Router();
    this.req = new Request('http://example.com');
    this.queue = new Queue();
    this.ctx = {
      waitUntil: async (work: Promise<any>) => {
        this.queue.increment();
        await work;
        this.queue.decrement();
      },
      passThroughOnException: () => { }
    };
    this.reqCtx = new Context(this.req, {}, this.ctx, {});

    // extract the context reference
    this.endpoint.use((ctx: Context, next: Function) => {
      this.reqCtx = ctx;
      next();
    });
  }

  use(fn: Function): this {
    this.endpoint.use(fn);
    return this; // maintains chaining functionality
  }

  async fetch(request?: Request, env?: any, ctx?: ExecutionContext): Promise<Response> {
    // provide default values or handle undefined cases
    const defaultRequest = request || this.req;
    const defaultEnv = env || {};
    const defaultCtx = ctx || this.ctx

    return this.endpoint.fetch(defaultRequest, defaultEnv, defaultCtx);
  }

  async onAfterComplete(fn: Function) {
    await this.queue.allComplete();
    fn(this.reqCtx);
  }
}


