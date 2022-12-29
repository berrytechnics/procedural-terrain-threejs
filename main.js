import "./style.css"
import * as THREE from "three"
import {createNoise2D} from 'simplex-noise'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up the terrain geometry
const terrainGeometry = new THREE.PlaneGeometry(200, 200, 199, 199);

// Define a simplex noise function
const simplex = new createNoise2D();

// Use the simplex noise function to generate heights for the terrain vertices
const positions = terrainGeometry.attributes.position.array;
for (let i = 0; i < positions.length; i += 3) {
  const x = positions[i];
  const y = positions[i + 1];
  positions[i + 2] = simplex(x / 50, y / 50) * 10;
}

// Use the simplex noise function to generate colors for the terrain vertices
const colors = [];
for (let i = 0; i < positions.length; i += 3) {
  const x = positions[i];
  const y = positions[i + 1];
  const color = new THREE.Color();
  color.setHSL(simplex(x / 50, y / 50) * 0.5 + 0.5, 0.5, 0.5);
  colors.push(color.r, color.g, color.b);
}
terrainGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

// Create a material for the terrain using GLSL
const terrainMaterial = new THREE.ShaderMaterial({
	uniforms: {
	  time: { value: 0.0 }
	},
	vertexShader: `
	  attribute vec3 color;
	  varying vec2 vUv;
	  varying vec3 vPosition;
	  varying vec3 vColor;
	  void main() {
		vUv = uv;
		vPosition = position;
		vColor = color;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	  }
	`,
	fragmentShader: `
	  uniform float time;
	  varying vec2 vUv;
	  varying vec3 vPosition;
	  varying vec3 vColor;
	  void main() {
		vec3 color = vColor;
		gl_FragColor = vec4(color, 1.0);
	  }
	`
  });

// Create the terrain mesh and add it to the scene
const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
scene.add(terrain);

// Set up the camera and start the renderer
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);

// Set up the Orbit Controls
const controls = new OrbitControls(camera,renderer.domElement)
controls.update()

const animate = function () {
  requestAnimationFrame(animate);
  controls.update()
  
  // Update the time uniform in the shader
  terrainMaterial.uniforms.time.value += 0.05;

  renderer.render(scene, camera);
};

animate();