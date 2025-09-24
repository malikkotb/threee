"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gsap from "gsap";
import { Timer } from "three/src/core/Timer.js";
export default function ThreeDTextPage() {
  const canvasRef = useRef(null);
  const debugObject = {};

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene
    const scene = new THREE.Scene();

    /* Textures */
    const textureLoader = new THREE.TextureLoader();
    const doorColorTexture = textureLoader.load(
      "/textures/door/color.jpg"
    );
    doorColorTexture.colorSpace = THREE.SRGBColorSpace;

    // Debug UI
    const gui = new GUI({ width: 260, title: "Debug UI" });

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // One unit in three.js can mean anything you want
    // having a sepcific unit ratio will help you create geometries
    // 1 unit = 1 meter (in this case)

    /**
     * House
     */
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: "#00fffc" })
    );
    floor.rotation.x = -Math.PI * 0.5;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    const houseGroup = new THREE.Group();
    scene.add(houseGroup);

    // walls
    const walls = new THREE.Mesh(
      new THREE.BoxGeometry(4, 2.5, 4),
      new THREE.MeshStandardMaterial({ color: "blue" })
    );
    walls.position.y += 2.5 / 2; // half of height
    houseGroup.add(walls);

    // roof
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(3.5, 1.5, 4),
      new THREE.MeshStandardMaterial({ color: "red" })
    );
    roof.rotation.y = -Math.PI * 0.25;
    roof.position.y = 2.5 + 0.75; // height of house + half of roof height (cone's origin is at center)
    houseGroup.add(roof);

    // door
    const door = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 2.2),
      new THREE.MeshStandardMaterial({ map: doorColorTexture })
    );
    door.position.y = 1;
    door.position.z = 2.01;
    door.position.x = 0;
    houseGroup.add(door);

    // bushes
    const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
    const bushMaterial = new THREE.MeshStandardMaterial({
      color: "green",
    });

    const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush1.scale.set(0.5, 0.5, 0.5);
    bush1.position.set(0.8, 0.2, 2.2);

    const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush2.scale.set(0.25, 0.25, 0.25);
    bush2.position.set(1.4, 0.1, 2.1);

    const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush3.scale.set(0.4, 0.4, 0.4);
    bush3.position.set(-0.8, 0.1, 2.2);

    const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush4.scale.set(0.15, 0.15, 0.15);
    bush4.position.set(-1, 0.05, 2.6);

    houseGroup.add(bush1, bush2, bush3, bush4);

    // Grave
    const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
    const graveMaterial = new THREE.MeshStandardMaterial({
      color: "gray",
    });
    const graves = new THREE.Group();
    scene.add(graves);

    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 4;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      // Mesh
      const grave = new THREE.Mesh(graveGeometry, graveMaterial);
      grave.position.x = x;
      grave.position.y = Math.random() * 0.4;
      grave.position.z = z;
      grave.rotation.x = (Math.random() - 0.5) * 0.4;
      grave.rotation.y = (Math.random() - 0.5) * 0.4;
      grave.rotation.z = (Math.random() - 0.5) * 0.4;

      // Add to the graves group
      graves.add(grave);
    }

    /**
     * Lights
     */
    // Ambient light
    const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(
      "#ffffff",
      1.5
    );
    directionalLight.position.set(3, 2, -8);
    scene.add(directionalLight);

    /**
     * Camera
     */
    // Base camera
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.x = 4;
    camera.position.y = 2;
    camera.position.z = 5;
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
    renderer.shadowMap.enabled = false; // deactivate if u want to use baking shadoes instead

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
    const timer = new Timer();
    let animationFrameId;

    const tick = () => {
      timer.update();
      const elapsedTime = timer.getElapsed();

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
