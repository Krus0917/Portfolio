import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

renderer.setClearColor(0xffffff, 1);

let cameraAspect = window.innerWidth / window.innerHeight;
const initialFrustumHeight = 2;
const camera = new THREE.OrthographicCamera(
    -cameraAspect,
    cameraAspect,
    initialFrustumHeight / 2,
    -initialFrustumHeight / 2,
    0.1,
    1000
);

camera.position.set(2.5, 0, 2);
camera.zoom = 1.5;

const scene = new THREE.Scene();
const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(1, 1, 1);
scene.add(light);
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls( camera, renderer.domElement );
const loader = new GLTFLoader();
let loadedModel = null;

loader.load('models/Luis Character Model - Main 2.glb', function (gltf) {
    loadedModel = gltf.scene;
    scene.add(loadedModel);
    fitCameraToObject(loadedModel);
}, undefined, function (error) {
    console.error(error);
});

function fitCameraToObject(object) {
    scene.updateMatrixWorld(true);

    const sphere = new THREE.Box3()
        .setFromObject(object)
        .getBoundingSphere(new THREE.Sphere());
    const direction = camera.position.clone().sub(controls.target).normalize();
    const objectHeight = Math.max(2 * sphere.radius, (2 * sphere.radius) / cameraAspect);
    const distance = Math.max(sphere.radius * 3, 0.1);

    controls.target.copy(sphere.center);
    camera.position.copy(sphere.center).addScaledVector(direction, distance);
    setCameraFrustum(objectHeight * 1.15);
    camera.near = Math.max(0.01, distance - sphere.radius * 1.2);
    camera.far = distance + sphere.radius * 1.2;
    camera.updateProjectionMatrix();
    controls.update();
}

function setCameraFrustum(height) {
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.left = -height * cameraAspect / 2;
    camera.right = height * cameraAspect / 2;
}

window.addEventListener('resize', function () {
    cameraAspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (loadedModel) {
        fitCameraToObject(loadedModel);
    } else {
        setCameraFrustum(initialFrustumHeight);
        camera.updateProjectionMatrix();
    }
});

renderer.setAnimationLoop(function () {
    renderer.render(scene, camera);
});