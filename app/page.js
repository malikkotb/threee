import Link from "next/link";

export default function Home() {
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-4xl font-bold'>Three.js</h1>
      <div className='flex flex-col items-center justify-center'>
        <Link href='/04-transform-objects'>04-transform-objects</Link>
        <Link href='/05-animations'>05-animations</Link>
        <Link href='/06-cameras'>06-cameras</Link>
        <Link href='/07-fullscreen-and-resizing'>
          07-fullscreen-and-resizing
        </Link>
        <Link href='/08-geometries'>08-geometries</Link>
      </div>
    </div>
  );
}
