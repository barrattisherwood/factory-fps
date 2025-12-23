/**
 * ObjectPool - Reusable object pool to avoid GC spikes
 * Critical for performance in FPS games (bullets, particles, etc.)
 */
export class ObjectPool {
  constructor(createFn, resetFn, initialSize = 20) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    
    // Pre-create objects
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  /**
   * Get an object from the pool
   * @returns {*} Object from pool or newly created
   */
  get() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    // Create new if pool is empty
    return this.createFn();
  }

  /**
   * Return an object to the pool
   * @param {*} obj - Object to return to pool
   */
  release(obj) {
    this.resetFn(obj);
    this.pool.push(obj);
  }

  /**
   * Get current pool size (for debugging)
   * @returns {number} Number of available objects
   */
  getSize() {
    return this.pool.length;
  }
}
