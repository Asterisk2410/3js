// Import necessary modules
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// const loader = new GLTFLoader();


// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
let botAnimation
let character


// Set renderer size
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene-container').appendChild(renderer.domElement);

// const controls = new OrbitControls( camera, renderer.domElement );

// // Set background image
const loader = new THREE.TextureLoader();
loader.load('./static/images/3d_images.jpg', function(texture) {
    scene.background = texture;

});

// Set camera position
camera.position.set(0, 1, 4);

// Add lights
const light = new THREE.AmbientLight(0x404040, 2); // Soft white light
scene.add(light);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(directionalLight);
// directionalLight.target = character;

// Load GLB model
const gltfLoader = new GLTFLoader();
gltfLoader.load('./static/model/Camila.glb', function(gltf) {
    const character = gltf.scene; // The loaded character
    scene.add(character);
    character.position.set(0.4, 0.5, 2);
    character.scale.set(0.5, 0.5, 0.5);
    character.rotation.set(0, -0.5, 0);

    const mixer = new THREE.AnimationMixer(character);
    botAnimation = gltf.animations;   
    botAnimation.forEach((clip) => {
        if(clip.name === "Idle 1"){
            mixer.clipAction(clip.optimize()).play()    
        }
        if(clip.name === "Eye Blink"){
            mixer.clipAction(clip.optimize()).play()    
        }        
    });

    function animate() {
        requestAnimationFrame(animate);
        mixer.update(0.01); // Update the mixer to advance the animation
        renderer.render(scene, camera);
    }

    animate();
}, undefined, function(error) {
    console.error('GLB model failed to load:', error);
});


// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', function() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});
