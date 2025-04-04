import Image from "next/image";
import Link from "next/link";

console.log("Tailwind está funcionando?");

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* Navbar */}
      <header className="bg-white shadow-md w-full py-4 px-6 flex justify-between items-center">
        <Image
          src="/logo.png" // Corrigido: certifique-se que a imagem está em "public/logo.png"
          alt="Face XD Logo"
          width={48}
          height={48}
          priority
        />
        <div className="flex gap-4">
          <Link href="/auth/login" passHref>
            <span className="px-6 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 cursor-pointer">
              Login
            </span>
          </Link>
          <Link href="/auth/register" passHref>
            <span className="px-6 py-2 bg-green-500 text-white font-semibold rounded hover:bg-green-600 cursor-pointer">
              Registrar
            </span>
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="text-center mt-16 max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-800">
          Face XD: A Rede Social Exclusiva para São Paulo
        </h1>
        <p className="text-lg mt-4 text-gray-600">
          Face XD é uma iniciativa inovadora criada por David Xavier para promover a educação e o auto desenvolvimento.
          Conecte-se com pessoas da sua cidade e cresça pessoal e profissionalmente.
        </p>
      </main>
    </div>
  );
}
