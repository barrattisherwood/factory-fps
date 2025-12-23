import * as THREE from 'three';

/**
 * DebugRenderer - Visual debugging tools for FPS development
 * Toggle with backtick (`) key
 */
export class DebugRenderer {
  constructor(scene) {
    this.scene = scene;
    this.enabled = false;
    this.helpers = [];
    this.temporaryHelpers = [];
    
    // Setup keyboard toggle
    this.setupToggle();
    
    console.log('DebugRenderer initialized. Press ` (backtick) to toggle visual debugging.');
  }

  setupToggle() {
    document.addEventListener('keydown', (e) => {
      if (e.key === '`') {
        this.toggle();
      }
    });
  }

  toggle() {
    this.enabled = !this.enabled;
    console.log(`Debug rendering: ${this.enabled ? 'ON' : 'OFF'}`);
    
    // Toggle visibility of all persistent helpers
    this.helpers.forEach(helper => {
      helper.visible = this.enabled;
    });
  }

  /**
   * Draw a ray (useful for raycasts, shooting direction)
   * @param {THREE.Vector3} origin - Ray origin
   * @param {THREE.Vector3} direction - Ray direction (normalized)
   * @param {number} length - Ray length
   * @param {number} color - Ray color
   * @param {boolean} persistent - Keep visible (default: auto-remove)
   */
  drawRay(origin, direction, length = 10, color = 0xff0000, persistent = false) {
    const points = [
      origin.clone(),
      origin.clone().add(direction.clone().multiplyScalar(length))
    ];
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color });
    const line = new THREE.Line(geometry, material);
    
    line.visible = this.enabled;
    this.scene.add(line);
    
    if (persistent) {
      this.helpers.push(line);
    } else {
      this.temporaryHelpers.push(line);
      // Auto-remove after 1 frame (16ms)
      setTimeout(() => {
        this.scene.remove(line);
        geometry.dispose();
        material.dispose();
        const index = this.temporaryHelpers.indexOf(line);
        if (index > -1) this.temporaryHelpers.splice(index, 1);
      }, 16);
    }
    
    return line;
  }

  /**
   * Draw a sphere (useful for collision detection, trigger zones)
   * @param {THREE.Vector3} position - Sphere center
   * @param {number} radius - Sphere radius
   * @param {number} color - Sphere color
   * @param {boolean} persistent - Keep visible
   */
  drawSphere(position, radius, color = 0x00ff00, persistent = false) {
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(position);
    sphere.visible = this.enabled;
    
    this.scene.add(sphere);
    
    if (persistent) {
      this.helpers.push(sphere);
    } else {
      this.temporaryHelpers.push(sphere);
      setTimeout(() => {
        this.scene.remove(sphere);
        geometry.dispose();
        material.dispose();
        const index = this.temporaryHelpers.indexOf(sphere);
        if (index > -1) this.temporaryHelpers.splice(index, 1);
      }, 16);
    }
    
    return sphere;
  }

  /**
   * Draw a box (useful for AABB collision visualization)
   * @param {THREE.Vector3} position - Box center
   * @param {THREE.Vector3} size - Box dimensions
   * @param {number} color - Box color
   * @param {boolean} persistent - Keep visible
   */
  drawBox(position, size, color = 0xffff00, persistent = false) {
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ color });
    const box = new THREE.LineSegments(edges, material);
    box.position.copy(position);
    box.visible = this.enabled;
    
    this.scene.add(box);
    
    if (persistent) {
      this.helpers.push(box);
    } else {
      this.temporaryHelpers.push(box);
      setTimeout(() => {
        this.scene.remove(box);
        geometry.dispose();
        edges.dispose();
        material.dispose();
        const index = this.temporaryHelpers.indexOf(box);
        if (index > -1) this.temporaryHelpers.splice(index, 1);
      }, 16);
    }
    
    return box;
  }

  /**
   * Draw a point (useful for hit locations)
   * @param {THREE.Vector3} position - Point position
   * @param {number} color - Point color
   * @param {number} size - Point size
   */
  drawPoint(position, color = 0xff00ff, size = 0.2) {
    return this.drawSphere(position, size, color, false);
  }

  /**
   * Log text to console with position context
   * @param {string} text - Text to log
   * @param {THREE.Vector3} position - Related position
   * @param {number} color - Console color (for grouping)
   */
  drawText(text, position, color = 0xffffff) {
    if (!this.enabled) return;
    
    const pos = `(${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)})`;
    console.log(`%c[DEBUG] ${pos}: ${text}`, `color: #${color.toString(16).padStart(6, '0')}`);
  }

  /**
   * Draw an arrow (useful for velocity, force visualization)
   * @param {THREE.Vector3} origin - Arrow start
   * @param {THREE.Vector3} direction - Arrow direction
   * @param {number} length - Arrow length
   * @param {number} color - Arrow color
   */
  drawArrow(origin, direction, length = 1, color = 0x00ffff) {
    const arrowHelper = new THREE.ArrowHelper(
      direction.normalize(),
      origin,
      length,
      color
    );
    arrowHelper.visible = this.enabled;
    
    this.scene.add(arrowHelper);
    this.temporaryHelpers.push(arrowHelper);
    
    setTimeout(() => {
      this.scene.remove(arrowHelper);
      arrowHelper.dispose();
      const index = this.temporaryHelpers.indexOf(arrowHelper);
      if (index > -1) this.temporaryHelpers.splice(index, 1);
    }, 16);
    
    return arrowHelper;
  }

  /**
   * Clear all persistent debug helpers
   */
  clear() {
    this.helpers.forEach(helper => {
      this.scene.remove(helper);
      if (helper.geometry) helper.geometry.dispose();
      if (helper.material) helper.material.dispose();
    });
    this.helpers = [];
  }

  /**
   * Cleanup on destruction
   */
  destroy() {
    this.clear();
    this.temporaryHelpers.forEach(helper => {
      this.scene.remove(helper);
      if (helper.geometry) helper.geometry.dispose();
      if (helper.material) helper.material.dispose();
    });
    this.temporaryHelpers = [];
  }
}
