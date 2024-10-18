import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href={"/"} className="flex items-center gap-4">
            <Image
              width={50}
              height={50}
              alt="Logo"
              src="/images/bah-logo.png"
              className="rounded-full"
            />
            <h1 className="hidden text-2xl font-semibold text-gray-800 sm:block">
              Büyük Anadolu Hastaneleri
            </h1>
          </Link>

          <div className="flex sm:items-center">
            <Link href="/">
              <p className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md text-sm font-medium transition duration-200">
                Dosyaları Listele
              </p>
            </Link>
            <Link href="/admin">
              <p className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md text-sm font-medium transition duration-200">
                Dosya Yükle
              </p>
            </Link>
          </div>
        </div>
      </div>

    </nav>
  );
}
