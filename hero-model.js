import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector('#hero-model-canvas');
const portrait = canvas.parentElement;
const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true});
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

let aspect = 1;
let model = null;
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
camera.position.set(2.5, 0, 2);

const scene = new THREE.Scene();
const fillLight = new THREE.HemisphereLight(0xffffff, 0x777777, 2);
scene.add(fillLight);

const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(1, 1, 1);
scene.add(light);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enableZoom = false;
controls.enablePan = false;

function setFrustum(height) {
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.left = -height * aspect / 2;
    camera.right = height * aspect / 2;
}

function frameModel() {
    scene.updateMatrixWorld(true);

    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const sphere = bounds.getBoundingSphere(new THREE.Sphere());
    const direction = camera.position.clone().sub(controls.target).normalize();
    const viewDirection = direction.clone().negate();
    const cameraRight = new THREE.Vector3().crossVectors(viewDirection, camera.up).normalize();
    const objectWidth = Math.abs(cameraRight.x) * size.x + Math.abs(cameraRight.z) * size.z;
    const objectHeight = Math.max(size.y, objectWidth / aspect);
    const distance = Math.max(sphere.radius * 3, 0.1);

    controls.target.copy(sphere.center);
    camera.position.copy(sphere.center).addScaledVector(direction, distance);
    setFrustum(objectHeight * 1.15);
    camera.near = Math.max(0.01, distance - sphere.radius * 1.2);
    camera.far = distance + sphere.radius * 1.2;
    camera.updateProjectionMatrix();
    controls.update();
}

function resize() {
    const {width, height} = canvas.getBoundingClientRect();
    if (!width || !height) return;

    aspect = width / height;
    renderer.setSize(width, height, false);

    if (model) {
        frameModel();
    } else {
        setFrustum(2);
        camera.updateProjectionMatrix();
    }
}

new ResizeObserver(resize).observe(portrait);
resize();

new GLTFLoader().load('models/Luis Character Model - Main 2.glb', function (gltf) {
    model = gltf.scene;
    scene.add(model);
    frameModel();
}, undefined, function (error) {
    console.error(error);
});

renderer.setAnimationLoop(function () {
    controls.update();
    renderer.render(scene, camera);
});
