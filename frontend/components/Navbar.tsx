'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-blue-900 text-white px-8 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🚆</span>
        <span className="text-xl font-bold">SNCFT</span>
      </div>

      <div className="flex gap-6 items-center">
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
        {isAdmin && (
          <Link href="/dashboard" className="hover:text-blue-200 transition">
            Dashboard
          </Link>
        )}
      </div>

      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-200">{user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              Déconnexion
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-white text-blue-900 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            Connexion
          </Link>
        )}
      </div>
    </nav>
  );
}
