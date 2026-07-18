'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStations } from '@/lib/api';
import { Station } from '@/types';

export default function Home() {
  const [stations, setStations] = useState<Station[]>([]);
  const [depart, setDepart] = useState('');
  const [arrivee, setArrivee] = useState('');
  const router = useRouter();

  useEffect(() => {
    getStations().then(setStations);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (depart && arrivee) {
      router.push(`/horaires?depart=${depart}&arrivee=${arrivee}`);
    }
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-12 text-white text-center mb-8">
        <div className="text-5xl mb-4">🚆</div>
        <h1 className="text-4xl font-bold mb-2">Bienvenue sur SNCFT</h1>
        <p className="text-blue-200 text-lg mb-8">Consultez les horaires des trains tunisiens en temps réel</p>

        {/* Formulaire recherche */}
        <form onSubmit={handleSearch} className="bg-white rounded-xl p-6 max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Départ</label>
              <select
                value={depart}
                onChange={e => setDepart(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Choisir --</option>
                {stations.map(s => (
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Arrivée</label>
              <select
                value={arrivee}
                onChange={e => setArrivee(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Choisir --</option>
                {stations.map(s => (
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 rounded-lg transition"
              >
                🔍 Rechercher
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-4xl mb-3">🕐</div>
          <h2 className="text-lg font-semibold text-blue-800">Horaires en temps réel</h2>
          <p className="text-gray-500 text-sm mt-1">Consultez les horaires et statuts de tous les trains</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-4xl mb-3">⭐</div>
          <h2 className="text-lg font-semibold text-blue-800">Trains favoris</h2>
          <p className="text-gray-500 text-sm mt-1">Sauvegardez vos trains et recevez des alertes</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-4xl mb-3">🔔</div>
          <h2 className="text-lg font-semibold text-blue-800">Notifications</h2>
          <p className="text-gray-500 text-sm mt-1">Soyez alerté en cas de retard ou annulation</p>
        </div>
      </div>
    </div>
  );
}
