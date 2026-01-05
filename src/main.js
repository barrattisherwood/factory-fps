import * as THREE from 'three';
import { Game } from './Game.js';
import './style.css';

// Initialize Three.js scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a); // Dark background
scene.fog = new THREE.Fog(0x1a1a1a, 0, 500);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.7, 0);
camera.rotation.y = Math.PI; // Rotate 180 degrees to face the other direction

// Add camera to scene so its children (gun) are rendered
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowShadowMap;
document.body.appendChild(renderer.domElement);

// Create game instance
const game = new Game(scene, camera);

// Game loop
function animate() {
  requestAnimationFrame(animate);
  game.update();
  renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
