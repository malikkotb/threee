"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gsap from "gsap";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
export default function ThreeDTextPage() {
  const canvasRef = useRef(null);
  const debugObject = {};

  useEffect(() => {
    if (!canvasRef.current) return;

    // Debug UI
    const gui = new GUI({ width: 260, title: "Debug UI" });

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Scene
    const scene = new THREE.Scene();

    /**
     * Lights
     */
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    gui.add(ambientLight, "intensity").min(0).max(3).step(0.001);
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(
      0xffffff,
      1.5
    );
    directionalLight.position.set(2, 2, -1);
    gui.add(directionalLight, "intensity").min(0).max(3).step(0.001);
    gui
      .add(directionalLight.position, "x")
      .min(-5)
      .max(5)
      .step(0.001);
    gui
      .add(directionalLight.position, "y")
      .min(-5)
      .max(5)
      .step(0.001);
    gui
      .add(directionalLight.position, "z")
      .min(-5)
      .max(5)
      .step(0.001);
    scene.add(directionalLight);

    directionalLight.castShadow = true;

    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;

    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 6;

    directionalLight.shadow.camera.top = 2;
    directionalLight.shadow.camera.right = 2;
    directionalLight.shadow.camera.bottom = -2;
    directionalLight.shadow.camera.left = -2;

    /* Shadows */
    // dark shadows in the back of objects are called core shadows
    // -> what we are missing is drop shadows

    // when u do one render, three.js will do a render for each light supportin shadows
    // those renders will simulate what the light sees as if it was a camera
    // during these light renders, a MeshDepthMaterial replaces all mesh materials
    // the light renders are stored as textures (-> shadow maps)
    // they are then used on all the materials that are supposed to receive shadows and projected on the geometry

    // example: https://threejs.org/examples/webgl_shadowmap_viewer.htmls

    // how to activate shadows
    // renderer.shadowMap.enabled = true;
    // go through each object and devicide if object can cast shadows, and objects that receive shadows
    // object.castShadow = true; object.receiveShadow = true;
    // only following types of lights support shadows: pointlight, directionallight, spotlight
    // activate the shadows on the light with: light.castShadow = true;

    // Shadow Map optimizations
    // render size: bigger is better, but more expensive
    // by default its 512x512, keep it in a power of 2 for mipmapping

    // Near and Far
    // to see near and far plane, we can use the camera helper

    // to help us debug, we can use a CameraHelper with the camera used for the shadow map located in directionalLight.shadow.camera
    const directionalLightCameraHelper = new THREE.CameraHelper(
      directionalLight.shadow.camera
    );
    // scene.add(directionalLightCameraHelper);

    // Amplitude
    // we can see from cameraHelper, that the amplitude is too large
    // bc. we are using a directional light, three.js is using an OrthographicCamera
    // we can control how far on each side the camera can see with directionalLight.shadow.camera.left, right, top, bottom
    // the smaller the values, the more precise the shadows will be
    // If it's too small, the shadows will be cropped

    // Blur
    // you can control the shadow blur with radius property
    directionalLight.shadow.radius = 10;
    // this technique doesnt use the proximity of the camera with the object; it's a general and cheap blur

    // Shadow Map algorithm
    // different types of algorithms can be applied to shadow maps
    // THREE. BasicShadowMap -Very performant but lousy quality
    // THREE.PCFShadowMap -Less performant but smoother edges (default)
    // THREE.PCFSoftShadowMap — Less performant but even softer edges
    // THREE.VSMShadowMap —Less performant, more constraints, can have unexpected results
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap; // set on renderer
    // the radius doesnt work with the PCFSoftShadowMap though

    /**
     * Materials
     */
    const material = new THREE.MeshStandardMaterial();
    material.roughness = 0.7;
    gui.add(material, "metalness").min(0).max(1).step(0.001);
    gui.add(material, "roughness").min(0).max(1).step(0.001);

    /**
     * Objects
     */
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      material
    );

    sphere.castShadow = true;

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      material
    );
    plane.rotation.x = -Math.PI * 0.5;
    plane.position.y = -0.5;

    plane.receiveShadow = true;

    scene.add(sphere, plane);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.x = 1;
    camera.position.y = 1;
    camera.position.z = 2;
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvasRef.current);
    controls.enableDamping = true;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // activate shadow map
    renderer.shadowMap.enabled = true;

    // set the algorithm to use for the shadow map
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // set on renderer

    // Resize
    const onResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", onResize);

    // Animate
    const clock = new THREE.Clock();
    let animationFrameId;

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // update controls
      controls.update();

      // Render
      renderer.render(scene, camera);

      animationFrameId = window.requestAnimationFrame(tick);
    };

    // call tick again on the next frame
    tick();

    // Cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className='webgl' />;
}
