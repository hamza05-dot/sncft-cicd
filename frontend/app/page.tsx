import Link from 'next/link';

export default function Home() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold text-blue-800 mb-4">
        🚆 Bienvenue sur SNCFT
      </h1>
      <p className="text-gray-500 text-lg mb-12">
        Système de suivi des horaires ferroviaires tunisiens
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        <Link href="/horaires" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-3">🕐</div>
          <h2 className="text-xl font-semibold text-blue-800">Horaires</h2>
          <p className="text-gray-500 text-sm mt-1">Consulter les horaires des trains</p>
        </Link>

        <Link href="/trains" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-3">🚂</div>
          <h2 className="text-xl font-semibold text-blue-800">Trains</h2>
          <p className="text-gray-500 text-sm mt-1">Liste des trains disponibles</p>
        </Link>

        <Link href="/stations" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
          <div className="text-4xl mb-3">🏛️</div>
          <h2 className="text-xl font-semibold text-blue-800">Stations</h2>
          <p className="text-gray-500 text-sm mt-1">Liste des gares tunisiennes</p>
        </Link>
      </div>
    </div>
  );
}
