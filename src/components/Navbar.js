// Caminho: /components/Navbar.js

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 p-4 text-white shadow-md fixed w-full top-0 z-10">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-lg font-bold">FaceXD</h1>
        <div className="flex gap-4">
          <Link href="/feed" className="hover:underline">
            Feed
          </Link>
          <Link href="/profile/1" className="hover:underline">
            Meu Perfil
          </Link>
        </div>
      </div>
    </nav>
  );
}
