'use client';

import { useEffect, useState } from 'react';
import { getTrains } from '@/lib/api';
import { Train } from '@/types';

export default function TrainsPage() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrains().then(data => {
      setTrains(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-800 mb-6">🚂 Liste des Trains</h1>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : trains.length === 0 ? (
        <p className="text-gray-400">Aucun train disponible.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trains.map(t => (
            <div key={t.id} className="bg-white rounded-xl shadow p-5">
              <div className="text-3xl mb-2">🚂</div>
              <h2 className="text-lg font-bold text-blue-800">{t.numero}</h2>
              <p className="text-gray-500 text-sm">Type : {t.type}</p>
              <p className="text-gray-500 text-sm">Capacité : {t.capacite} places</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
