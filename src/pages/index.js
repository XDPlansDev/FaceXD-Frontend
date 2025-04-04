import Button from "@/components/Button";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      
      {/* Navbar */}
      <header className="bg-white shadow-md w-full py-4 px-6 flex justify-center items-center">
        <Image src="/logo.png" alt="Face XD Logo" width={60} height={60} priority />
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

        {/* Botões Centralizados */}
        <div className="mt-8 flex justify-center gap-6">
          <Link href="/auth/login" passHref>
            <Button>Login</Button>
          </Link>

          <Link href="/auth/register" passHref>
            <Button>Registrar</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
