import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-blue-800 text-white px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🚆</span>
        <span className="text-xl font-bold">SNCFT</span>
      </div>
      <div className="flex gap-6">
        <Link href="/" className="hover:text-blue-200 transition">
          Accueil
        </Link>
        <Link href="/horaires" className="hover:text-blue-200 transition">
          Horaires
        </Link>
        <Link href="/trains" className="hover:text-blue-200 transition">
          Trains
        </Link>
        <Link href="/stations" className="hover:text-blue-200 transition">
          Stations
        </Link>
      </div>
    </nav>
  );
}
