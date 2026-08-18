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

  const isEmploye = user?.roles?.includes('ROLE_EMPLOYE');

  return (
    <nav className="bg-blue-900 text-white px-8 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🚆</span>
        <span className="text-xl font-bold">SNCFT</span>
      </div>

      <div className="flex gap-6 items-center">
        <Link href="/" className="hover:text-blue-200 transition">Accueil</Link>
        <Link href="/horaires" className="hover:text-blue-200 transition">Horaires</Link>
        {user && !isAdmin && !isEmploye && (
          <Link href="/mes-favoris" className="hover:text-blue-200 transition">Mes Favoris</Link>
        )}
        {isEmploye && (
          <Link href="/espace-employe" className="hover:text-blue-200 transition">Mon Espace</Link>
        )}
        {isAdmin && (
          <Link href="/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>
        )}
      </div>

      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/profil" className="text-sm text-blue-200 hover:text-white transition">
              {user.email}
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              Deconnexion
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link href="/login"
              className="bg-white text-blue-900 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold transition">
              Connexion
            </Link>
            <Link href="/register"
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
              Inscription
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
