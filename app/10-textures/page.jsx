"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gsap from "gsap";

/* Textures */

const textureLoader = new THREE.TextureLoader();

const texture = textureLoader.load("/textures/door/color.jpg");

// Loadingmanager to mutualize events
// useful if we want to know global loading progress or be informed when all the textures are loaded

texture.colorSpace = THREE.SRGBColorSpace;

export default function GeometriesPage() {
  const canvasRef = useRef(null);
  const debugObject = {};

  // Textures are based on images that will cover the surface of the geometries.
  // -> many types with many different effects

  // color (albedo) -> most simple texture, applied on the geometry

  // alpha -> grayscale image, white visible black not visible

  // Height (or displacement) -> heightmap
  // grayscale image, heightmap, can be used for a displacement map
  // move the vertices to create some relief
  // if it's white the vertices will go up and if its black it will go down
  // and if it's a perfect gray between white and black the vertices won't move.
  // need enough subdivision though! -> to have enough vertices

  // Normal
  // add details (regarding to things like light)
  // doesn't need subdivision
  // the vertices won't move
  // lure the light about face orientation
  // better performance than adding a height texture (heightmap) with a lot of subdivisions

  // Ambient occlusion
  // grayscale image
  // adds fake shadows in crevices
  // not physically accurate
  // helps to create contrast and see details

  // Metalness
  // grayscale image
  // white is metallic, black is non-metallic, mostly for reflection

  // Roughness
  // grayscale image
  // in duo with metalness
  // white is rough, black is smooth, mostly for dissipation of light

  // these textures (espeecially metalness and roughness) folliw the PBR (physically based rendering) principles
  // many techniques that tend to follow real-life directions to get realistic results
  // becoming the standard for realisitc renders
  // many software, engines, and libraries are using it

  // how to load textures?
  // get url of the image

  useEffect(() => {
    if (!canvasRef.current) return;

    // Debug UI
    const gui = new GUI({ width: 300, title: "Debug UI" });
    gui.close();

    // Scene
    const scene = new THREE.Scene();

    // Object
    debugObject.color = "#35b673";
    const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);

    const material = new THREE.MeshBasicMaterial({
      map: texture,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // range
    // the object is mesh.position and the property is y
    gui
      .add(mesh.position, "y")
      .min(-3)
      .max(3)
      .step(0.01)
      .name("elevation");

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.z = 3;
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvasRef.current);
    controls.enableDamping = true;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
    });
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
    let animationFrameId;

    const tick = () => {
      // const elapsedTime = clock.getElapsedTime();

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
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className='webgl' />;
}
