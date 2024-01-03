// The `Queue` class is designed to manage and track a queue of asynchronous tasks. 
// It offers functionality to increment and decrement a counter representing the 
// number of active tasks. The class also provides a method to return a promise 
// that resolves when all tasks in the queue have been completed. This is achieved 
// by maintaining an array of callback functions, which are invoked when the task 
// count reaches zero, indicating that the queue is empty and all tasks are complete. 
// This class is particularly useful for scenarios where it's necessary to know when 
// a group of asynchronous operations have all finished executing.
export class Queue {
  counter: number;
  callbacks: Function[];

  constructor() {
    this.counter = 0;
    this.callbacks = [];
  }

  increment() {
    this.counter += 1;
  }

  decrement() {
    if (this.counter === 0) {
      return;
    }

    this.counter -= 1;

    if (this.callbacks.length > 0) {
      for (const cb of this.callbacks) {
        cb()
      }
    }
  }

  allComplete(): Promise<void> {
    return new Promise((resolve) => {
      // is there no work?
      if (this.counter == 0) {
        resolve();
        return;
      }

      // add to the list
      this.callbacks.push(resolve)
    });
  }
}
