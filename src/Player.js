import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export class Player {
  constructor(camera, game) {
    this.camera = camera;
    this.game = game;
    this.ammo = 50;
    this.moveSpeed = 0.1;
    this.keys = {};
    this.velocity = new THREE.Vector3();
    this.isGrounded = false;
    this.gravity = 0.01;
    this.jumpForce = 0.5;
    this.eyeHeight = 1.7; // Player eye height above ground
    this.canJump = true; // Can only jump once per ground contact
    this.spacePressed = false; // Track if space was pressed last frame

    // Setup pointer lock controls
    this.controls = new PointerLockControls(camera, document.body);
    this.isLocked = false;

    // Event listeners
    document.addEventListener('click', () => this.lock());
    document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));
    document.addEventListener('mousedown', (e) => this.onMouseDown(e));

    this.setupGun();
  }

  setupGun() {
    // Create gun group and add to scene
    this.gunGroup = new THREE.Group();
    this.game.scene.add(this.gunGroup);
    
    // Gun body
    const gunGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.5);
    const gunMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a,
      metalness: 0.9,
      roughness: 0.1
    });
    const gunMesh = new THREE.Mesh(gunGeometry, gunMaterial);
    gunMesh.castShadow = true;
    this.gunGroup.add(gunMesh);

    // Gun barrel
    const barrelGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 16);
    const barrelMesh = new THREE.Mesh(barrelGeometry, gunMaterial);
    barrelMesh.position.z = -0.3;
    barrelMesh.rotation.x = Math.PI / 2;
    barrelMesh.castShadow = true;
    this.gunGroup.add(barrelMesh);

    // Muzzle light
    this.muzzleLight = new THREE.PointLight(0xff6600, 0, 40);
    this.gunGroup.add(this.muzzleLight);

    // Muzzle flash
    const flashGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const flashMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0,
    });
    this.muzzleFlashMesh = new THREE.Mesh(flashGeometry, flashMaterial);
    this.muzzleFlashMesh.position.z = -0.5; // At barrel tip
    this.gunGroup.add(this.muzzleFlashMesh);
  }

  lock() {
    if (!this.isLocked) {
      this.controls.lock();
    }
  }

  onPointerLockChange() {
    this.isLocked = document.pointerLockElement === document.body;
  }

  onKeyDown(e) {
    this.keys[e.key.toLowerCase()] = true;
  }

  onKeyUp(e) {
    this.keys[e.key.toLowerCase()] = false;
  }

  onMouseDown(e) {
    if (e.button === 0 && this.isLocked) { // Left click
      this.shoot();
    }
  }

  shoot() {
    if (this.ammo <= 0) {
      console.log('No ammo!');
      return;
    }

    this.ammo--;
    this.game.ui.updateAmmo(this.ammo);

    // Muzzle flash
    this.createMuzzleFlash();

    // Raycast for hit detection
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.camera.quaternion);
    raycaster.set(this.camera.position, direction);

    const hits = raycaster.intersectObjects(this.game.enemies.map(e => e.getMesh()));
    if (hits.length > 0) {
      const hitEnemy = this.game.enemies.find(e => e.getMesh() === hits[0].object);
      if (hitEnemy) {
        console.log('Hit enemy!');
        hitEnemy.takeDamage(25);
      }
    }

    // Create bullet tracer line
    this.createBulletTracer(this.camera.position, direction);
  }

  createMuzzleFlash() {
    // Flash at barrel
    this.muzzleLight.intensity = 3;
    this.muzzleFlashMesh.material.opacity = 0.8;

    setTimeout(() => {
      this.muzzleLight.intensity = 0;
      this.muzzleFlashMesh.material.opacity = 0;
    }, 120);
  }

  createBulletTracer(origin, direction) {
    const distance = 100;
    const endPoint = origin.clone().add(direction.clone().multiplyScalar(distance));

    const geometry = new THREE.BufferGeometry().setFromPoints([origin, endPoint]);
    const material = new THREE.LineBasicMaterial({ color: 0xffaa00, linewidth: 2, transparent: true, opacity: 0.6 });
    const line = new THREE.Line(geometry, material);

    this.game.scene.add(line);

    // Remove after a short duration
    setTimeout(() => {
      this.game.scene.remove(line);
    }, 100);
  }

  update() {
    if (!this.isLocked) return;

    // Update gun position relative to camera (in camera local space)
    const gunOffset = new THREE.Vector3(0.3, -0.5, -0.8);
    gunOffset.applyQuaternion(this.camera.quaternion);
    
    this.gunGroup.position.copy(this.camera.position);
    this.gunGroup.position.add(gunOffset);
    this.gunGroup.quaternion.copy(this.camera.quaternion);

    // Movement - only on horizontal plane, ignore camera vertical tilt
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);

    // Zero out Y component to prevent camera tilt from affecting vertical velocity
    forward.y = 0;
    right.y = 0;
    forward.normalize();
    right.normalize();

    this.velocity.x = 0;
    this.velocity.z = 0;

    if (this.keys['w']) this.velocity.add(forward.multiplyScalar(this.moveSpeed));
    if (this.keys['s']) this.velocity.sub(forward.multiplyScalar(this.moveSpeed));
    if (this.keys['a']) this.velocity.sub(right.multiplyScalar(this.moveSpeed));
    if (this.keys['d']) this.velocity.add(right.multiplyScalar(this.moveSpeed));

    // Check if on ground
    if (this.camera.position.y <= this.eyeHeight) {
      this.camera.position.y = this.eyeHeight;
      this.isGrounded = true;
      this.canJump = true;
      
      // Stop downward velocity when on ground
      if (this.velocity.y < 0) {
        this.velocity.y = 0;
      }
    } else {
      this.isGrounded = false;
    }

    // Jump - only on key press transition (not held)
    const spaceDown = this.keys[' '];
    if (spaceDown && !this.spacePressed && this.isGrounded) {
      this.velocity.y = this.jumpForce;
    }
    this.spacePressed = spaceDown;

    // Apply gravity
    if (!this.isGrounded) {
      this.velocity.y -= this.gravity;
    }

    this.camera.position.add(this.velocity);
  }

  addAmmo(amount) {
    this.ammo += amount;
  }

  getGroup() {
    return new THREE.Group(); // Empty group, camera is controlled differently
  }
}
