"use client";
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function BulgeDistortionAnimation() {
  const mountRef = useRef();

  useEffect(() => {
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      100
    );
    camera.position.z = 2;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0xffffff, 1); // Set white background
    mountRef.current.appendChild(renderer.domElement);

    // Mouse tracking
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      
      // Calculate normalized mouse position (0 to 1)
      mouse.x = (e.clientX - rect.left) / rect.width;
      mouse.y = 1 - (e.clientY - rect.top) / rect.height; // Flip Y for UV space
      
      console.log('Mouse position:', { x: mouse.x.toFixed(3), y: mouse.y.toFixed(3) });
    };
    window.addEventListener("mousemove", onMouseMove);

    // Material with displacement map and color texture
      const textureLoader = new THREE.TextureLoader();
      // const texture = textureLoader.load("/textures/blurGradient.png");
      const texture = textureLoader.load("/textures/ball.png");

      const material = new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        uniforms: {
          uTexture: { value: texture },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uStrength: { value: 0.45 },
          uRadius: { value: 0.25 }, // Radius of influence for the bulge
        },
      vertexShader: `
        uniform vec2 uMouse;
        uniform float uStrength;
        uniform float uRadius;
        varying vec2 vUv;

        void main() {
          vUv = uv;
          vec3 pos = position;
          
          // Calculate distance from mouse in UV space
          float dist = distance(uv, uMouse);
          
          // Gaussian-like falloff for smoother bulge
          float influence = exp(-dist * dist / (uRadius * uRadius));
          
          // Create smooth bulge
          pos.z += influence * uStrength;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        varying vec2 vUv;

        void main() {
          gl_FragColor = texture2D(uTexture, vUv);
        }
      `,
    });

    // Plane geometry
    // more subdivions for a smoother effect (256)
    const geometry = new THREE.PlaneGeometry(0.8, 1, 256, 256);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      material.uniforms.uMouse.value.set(mouse.x, mouse.y);
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      mountRef.current.removeChild(renderer.domElement);
        geometry.dispose();
        material.dispose();
        texture.dispose();
    };
  }, []);

  return (
    <div style={{
      width: "100%",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "fixed",
      top: 0,
      left: 0,
    }}>
      <div
        ref={mountRef}
        style={{
          width: "75vh",
          height: "75vh",
          border: "1px solid red",
        }}
      />
    </div>
  );
}
