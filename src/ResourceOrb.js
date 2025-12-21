import * as THREE from 'three';

export class ResourceOrb {
  constructor(x, y, z) {
    this.position = new THREE.Vector3(x, y, z);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.bobAmount = 0;
    this.bobSpeed = 0.1;
    this.attractionDistance = 5;
    this.attractionForce = 0.02;
    this.isFlyingToPlayer = false;
    this.collected = false;

    this.createMesh();
  }

  createMesh() {
    // Create glowing cyan orb
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ccff,
      emissiveIntensity: 0.8,
      metalness: 0.3,
      roughness: 0.1,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    this.mesh.castShadow = true;

    // Add point light
    this.light = new THREE.PointLight(0x00ffff, 1, 15);
    this.light.position.copy(this.position);
    this.mesh.add(this.light);

    // Initial upward velocity for explosion effect
    this.velocity.y = 0.2;
  }

  getMesh() {
    return this.mesh;
  }

  update(playerPosition) {
    if (this.collected) return;

    // Apply gravity
    this.velocity.y -= 0.01;

    // Check if within attraction distance
    const distance = this.mesh.position.distanceTo(playerPosition);
    if (distance < this.attractionDistance) {
      this.isFlyingToPlayer = true;
    }

    if (this.isFlyingToPlayer) {
      // Attract to player
      const direction = playerPosition.clone().sub(this.mesh.position).normalize();
      this.velocity.add(direction.multiplyScalar(this.attractionForce));
    }

    // Apply velocity
    this.mesh.position.add(this.velocity);

    // Prevent orb from falling through ground
    if (this.mesh.position.y < 0.5) {
      this.mesh.position.y = 0.5;
      if (this.velocity.y < 0) this.velocity.y = 0;
    }

    // Hover/bob animation
    this.bobAmount += this.bobSpeed;
    if (!this.isFlyingToPlayer) {
      this.mesh.position.y += Math.sin(this.bobAmount) * 0.01;
    }

    // Update light position
    this.light.position.copy(this.mesh.position);
  }

  collect() {
    this.collected = true;
  }
}
