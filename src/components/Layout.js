// Caminho: /components/Layout.js

import Navbar from "@/components/Navbar";

export default function Layout({ children }) {
  return (
    <div>
      <Navbar />
      <main className="pt-16 max-w-4xl mx-auto p-4">{children}</main>
    </div>
  );
}
