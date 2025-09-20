"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gsap from "gsap";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader";
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
    // omidirectional light, it illuminates all objects in the scene equally
    // good to simulate light bouncing
    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // color, intensity
    // scene.add(ambientLight);

    // directional light, it illuminates all objects in the scene from a specific direction
    // will have a sun-like effect
    const directionalLight = new THREE.DirectionalLight(
      0x00fffc,
      1.3
    ); // color, intensity
    directionalLight.position.set(1, 0.25, 0);
    // scene.add(directionalLight);

    // hemisphere light
    // similar to ambientlight, but with a different color from the sky than the color coming from the ground
    const hemisphereLight = new THREE.HemisphereLight(
      0xff0000,
      0x0000ff,
      2.3
    ); // color (or skyColor), groundColor, intensity
    // hemisphereLight.position.set(1, 1, 1);
    // scene.add(hemisphereLight);

    // point light, it illuminates all objects in the scene from a specific point
    // by default the light intensity doesnt fade
    // we can control the fade distance and how fast it fades with 'distance' and 'decay' properties
    // decay is how fast the light dims
    const pointLight = new THREE.PointLight(0xff9000, 2.5, 10, 2); // color, intensity, distance, decay
    pointLight.position.set(1, -0.5, 1);
    // scene.add(pointLight);

    // light helper
    // const pointLightHelper = new THREE.PointLightHelper(pointLight);
    // scene.add(pointLightHelper);

    // rect area light
    // works like the big rectangle lights you can see on photoshoot set
    // its a mix between a directional light and a diffuse light
    const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 10, 1, 1); // color, intensity, width, height
    // rectAreaLight.position.set(-1.5, 0, 1.5);
    // rectAreaLight.lookAt(new THREE.Vector3());
    scene.add(rectAreaLight);

    /**
     * Objects
     */
    // Material
    const material = new THREE.MeshStandardMaterial();
    material.roughness = 0.4;

    // Objects
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      material
    );
    sphere.position.x = -1.5;

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.75, 0.75),
      material
    );

    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.2, 32, 64),
      material
    );
    torus.position.x = 1.5;

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      material
    );
    plane.rotation.x = -Math.PI * 0.5;
    plane.position.y = -0.65;

    scene.add(sphere, cube, torus, plane);

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

    // Enable physically correct lighting
    renderer.physicallyCorrectLights = true;

    // Configure tone mapping
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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

      // Update objects
      sphere.rotation.y = 0.1 * elapsedTime;
      cube.rotation.y = 0.1 * elapsedTime;
      torus.rotation.y = 0.1 * elapsedTime;

      sphere.rotation.x = 0.15 * elapsedTime;
      cube.rotation.x = 0.15 * elapsedTime;
      torus.rotation.x = 0.15 * elapsedTime;

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
      textMaterial.dispose();
      donutMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className='webgl' />;
}
