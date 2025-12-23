/**
 * GameObject - Base class for Entity-Component System
 * Composition over inheritance for maximum flexibility
 */
export class GameObject {
  constructor() {
    this.components = new Map();
    this.active = true;
  }

  /**
   * Add a component to this game object
   * @param {*} component - Component instance to add
   */
  addComponent(component) {
    this.components.set(component.constructor.name, component);
    component.owner = this;
    
    // Call component init if it exists
    if (component.init) {
      component.init();
    }
  }

  /**
   * Get a component by its class
   * @param {Function} ComponentClass - The component class
   * @returns {*} Component instance or undefined
   */
  getComponent(ComponentClass) {
    return this.components.get(ComponentClass.name);
  }

  /**
   * Remove a component
   * @param {Function} ComponentClass - The component class to remove
   */
  removeComponent(ComponentClass) {
    const component = this.components.get(ComponentClass.name);
    if (component && component.destroy) {
      component.destroy();
    }
    this.components.delete(ComponentClass.name);
  }

  /**
   * Update all components
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    if (!this.active) return;
    
    this.components.forEach(component => {
      if (component.update) {
        component.update(deltaTime);
      }
    });
  }

  /**
   * Destroy this game object and all components
   */
  destroy() {
    this.components.forEach(component => {
      if (component.destroy) {
        component.destroy();
      }
    });
    this.components.clear();
    this.active = false;
  }
}
