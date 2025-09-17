"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gsap from "gsap";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
export default function ThreeDTextPage() {
  const canvasRef = useRef(null);
  const debugObject = {};

  useEffect(() => {
    if (!canvasRef.current) return;

    // Debug UI
    const gui = new GUI({ width: 260, title: "Debug UI" });

    // Scene
    const scene = new THREE.Scene();

    // Axes helper
    const axesHelper = new THREE.AxesHelper();
    scene.add(axesHelper);

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    /**
     * Textures
     */
    const textureLoader = new THREE.TextureLoader();

    // Recreating the ilithya website
    // and create a big 3d text in the middle of the scene with objects floating around

    // TextBufferGeometry
    // we need a particular font format called Typeface (that supports 3d text)
    // How to get typeface ?
    // you can convert a font with tools like: https://gero3.github.io/facetype.js/
    // u can also use a font provided by Three.js
    // we can take the fonts from /three/exampes/fonts and put them in the /static/ folder or import them directly

    // Creating a text geometry is long and hard for the computer
    // avoid doing it too many times and keep the geometry as low poly as possible by reducing the curveSegements and bevelSegments
    // remove the wireframe once you are happy with the level of details

    /* Center the text */

    // 1. using bounding
    // the bounding is an information associated with the geometry that tells what space is taken by that geometry
    // it can be a box or a sphere
    // /textures/bounding.png
    // it helps Three.js calculate if the object is on the screen (frustum culling)
    // frsutum culling is about rendering or not rendering objects that are not on the screen

    // if an object is behind the camera (outside the frustum) -> don't render it
    // three.js won't use every vertex of a geometry and test whether its on the screen or not
    // no, they will just use mathematical calculations with box and sphere bounding to know
    // if it's supposed to render this object or not.

    // -> we're going to use the Box bounding to center the geometry

    // by default, three-js uses a sphere bounding
    // calculate the box bounding with computeBoundingBox()
    // the result is an instance of Box3 with min and max properties
    // The min property isn't at 0 because of the bevelThickness and bevelSize
    // -> instead of moving the mesh, we're going to move the whole geometry with translate(...)
    // the mesh will stay in the same position but the geometry will be moved
    // that way when we move/rotate the mesh, it rotates on its center.
    // the whole geometry rotates around its center.

    // the text will centered but its not 100% centered because of the bevelThickness and bevelSize

    // there is a much simpler way -> textGeometry.center() lol

    /* Fonts */
    const fontLoader = new FontLoader();
    fontLoader.load(
      "/fonts/helvetiker_regular.typeface.json",
      (font) => {
        // console.log(font);
        // create geometry
        const textGeometry = new TextGeometry("Next-level websites", {
          font: font,
          size: 0.5,
          depth: 0.2,
          curveSegments: 5,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 4,
        });
        // create material
        const textMaterial = new THREE.MeshNormalMaterial({
          wireframe: true,
        });
        // textGeometry.computeBoundingBox();
        // // center geometry on all axes
        // textGeometry.translate(
        //     // also substract bevelSize for each respective axis
        //   -(textGeometry.boundingBox.max.x - 0.02) * 0.5,
        //   -(textGeometry.boundingBox.max.y - 0.02) * 0.5,
        //   -(textGeometry.boundingBox.max.z - 0.03) * 0.5
        // );

        textGeometry.center();
        textGeometry.computeBoundingBox();
        console.log(textGeometry.boundingBox);

        // create mesh
        const text = new THREE.Mesh(textGeometry, textMaterial);
        scene.add(text);
      }
    );

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
