"use client";
import Link from "next/link";
import CubeInteraction from "./10-textures/cubeInteraction";
import Lenis from "lenis";
import { useEffect } from "react";
import DisplacementMap from "./11-materials/displacementMap";
import BulgeDistortionAnimation from "./11-materials/BulgeDistortionAnimation";
import ImageZoomScrollAnimation from "./16-particles/ImageZoomScrollAnimation";

export default function Home() {
  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis();

    // Use requestAnimationFrame to continuously update the scroll
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }, []);

  return (
    <main>
      {/* <CubeInteraction /> */}
      {/* <BulgeDistortionAnimation /> */}
      {/* <DisplacementMap /> */}
      <ImageZoomScrollAnimation />
      <div className='flex flex-col items-center justify-center h-screen'>
        <h1 className='text-4xl font-bold'>Three.js</h1>
        <div className='flex flex-col items-center justify-center'>
          <Link href='/04-transform-objects'>
            04-transform-objects
          </Link>
          <Link href='/05-animations'>05-animations</Link>
          <Link href='/06-cameras'>06-cameras</Link>
          <Link href='/07-fullscreen-and-resizing'>
            07-fullscreen-and-resizing
          </Link>
          <Link href='/08-geometries'>08-geometries</Link>
          <Link href='/09-debug-ui'>09-debug-ui</Link>
          <Link href='/10-textures'>10-textures</Link>
          <Link href='/11-materials'>11-materials</Link>
          <Link href='/12-3d-text'>12-3d-text</Link>
          <Link href='/13-lights'>13-lights</Link>
          <Link href='/14-shadows'>14-shadows</Link>
          <Link href='/15-haunted-house'>15-haunted-house</Link>
          <Link href='/16-particles'>16-particles</Link>
          <Link href='/17-galaxy-generator'>17-galaxy-generator</Link>
        </div>
      </div>
    </main>
  );
}
