"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function GeometriesPage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene
    const scene = new THREE.Scene();

    // Object
    // const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
    // parameters of BoxGeometry
    // width, height, depth, widthSegments, heightSegments, depthSegments
    // (also called subdivision in Blender -> having more triangles to have more details)
    // these segments enable the control of how much triangles you have on each face.
    // normally segments are 1, so you have 2 triangles on each face of a cube.
    // if you have 2 segments, you have 8 triangles on each face of a cube.
    // this is useful for terrain generation, etc. not so useful for a normal cube.

    // things get harder when it comes to creating our own geometries
    // we'll create a triangle and then create a bunch of triangles
    // by using BufferGeometries

    // How to store buffer geometry data? (The vertices)
    // we can store a lot of information per vertex
    // like position, uv, normal, etc.
    // -> using Float32Array (can only store floats, and has fixed length)

    // 9 floats (3 vertices), since we are creating a triangle
    const positionsArray = new Float32Array([
      0,
      0,
      0, // first vertex (x, y, z)
      0,
      1,
      0, // second vertex (x, y, z)
      1,
      0,
      0, // third vertex (x, y, z)
    ]);

    // we need to convert this to a Threejs buffer attribute
    const positionsAttribute = new THREE.BufferAttribute(
      positionsArray,
      3
    ); // 3 floats per vertex

    // if we were using uv coordinates, we would use 2 floats per vertex
    // const uvArray = new Float32Array([
    //   0, 0, // first vertex (u, v)
    //   0, 1, // second vertex (u, v)
    //   1, 0, // third vertex (u, v)
    // ]);
    // const uvAttribute = new THREE.BufferAttribute(uvArray, 2); // 2 floats per vertex

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", positionsAttribute);
    // NEED to set attribute to "position", this is the name of the value of the attribute we are sending
    // that will be used inside the shaders.
    

    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

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
    const clock = new THREE.Clock();
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
