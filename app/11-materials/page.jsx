"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gsap from "gsap";
import { TeapotGeometry } from "three/addons/geometries/TeapotGeometry.js";

export default function MaterialsPage() {
  const canvasRef = useRef(null);
  const debugObject = {};

  useEffect(() => {
    if (!canvasRef.current) return;

    // Debug UI
    const gui = new GUI({ width: 300, title: "Debug UI" });

    // Scene
    const scene = new THREE.Scene();

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    /* Textures */
    const textureLoader = new THREE.TextureLoader();
    const doorColorTexture = textureLoader.load(
      "/textures/door/color.jpg"
    );
    const doorAmbientOcclusionTexture = textureLoader.load(
      "/textures/door/ambientOcclusion.jpg"
    );
    const doorHeightTexture = textureLoader.load(
      "/textures/door/height.jpg"
    );
    const doorRoughnessTexture = textureLoader.load(
      "/textures/door/roughness.jpg"
    );
    const doorNormalTexture = textureLoader.load(
      "/textures/door/normal.jpg"
    );
    const doorMetalnessTexture = textureLoader.load(
      "/textures/door/metalness.jpg"
    );

    const matcapTexture = textureLoader.load(
      "/textures/matcaps/1.png"
    );

    const gradientTexture = textureLoader.load(
      "/textures/gradients/3.jpg"
    );

    // Change: Textures used as "map" and "matcap" are supposed to be encoded in sRGB color space
    matcapTexture.colorSpace = THREE.SRGBColorSpace;
    doorColorTexture.colorSpace = THREE.SRGBColorSpace;

    // Materials
    // are used to put a color on each visible "pixel" of a geometry
    // algorithms that decide on the color of each pixel are called shaders
    // three.js has many built-in materials with pre-made shaders

    /* Objects */

    /* MeshBasicMaterial */
    // const material = new THREE.MeshBasicMaterial({
    //   map: doorColorTexture,
    // });

    // PROPERTIES of MeshBasicMaterial (can be set in the constructor or after)
    // map: the texture to use
    // material.map = doorColorTexture;

    // color: the color to use, when changing color property directly, you MUST instantiate a new THREE.Color class
    // if we use both color and map, the color will tint the map
    // material.color = new THREE.Color(0xff0000);

    // wireframe: true to render the geometry as a wireframe
    // material.wireframe = true;

    // opacity: 0.5 to make the texture 50% transparent
    // material.transparent = true; // transparent: needs to be true to make the texture transparent
    // material.opacity = 0.5; // opacity value

    // alphaMap
    // material.alphaMap = doorAlphaTexture;
    // when the texture is white, its going to be visible and when its black its going to be hidden

    // side: THREE.DoubleSide to render the texture on both sides of the geometry
    // material.side = THREE.DoubleSide;

    /* MeshNormalMaterial - can be useful to debug the normals */
    // also just looks great on its own 
    // const material = new THREE.MeshNormalMaterial();
    // material.flatShading = true;


    


    // "normals" are information encoded in each vertex that contains the direction of the outisde of the face

    const sphere = new THREE.Mesh(
      // new TeapotGeometry(0.5, 0.2),
      new THREE.SphereGeometry(0.5, 16, 16),
      material
    );
    sphere.position.x = -1.5;

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      material
    );
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.2, 16, 32),
      material
    );
    torus.position.x = 1.5;

    scene.add(sphere, plane, torus);

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
    const clock = new THREE.Clock();
    let animationFrameId;

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // Update objects
      sphere.rotation.y = 0.1 * elapsedTime;
      plane.rotation.y = 0.1 * elapsedTime;
      torus.rotation.y = 0.1 * elapsedTime;

      sphere.rotation.x = -0.15 * elapsedTime;
      plane.rotation.x = -0.15 * elapsedTime;
      torus.rotation.x = -0.15 * elapsedTime;

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
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className='webgl' />;
}
