'use client';

import { useEffect, useState } from 'react';
import { getStations } from '@/lib/api';
import { Station } from '@/types';

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStations().then(data => {
      setStations(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-800 mb-6">🏛️ Liste des Stations</h1>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : stations.length === 0 ? (
        <p className="text-gray-400">Aucune station disponible.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stations.map(s => (
            <div key={s.id} className="bg-white rounded-xl shadow p-5">
              <div className="text-3xl mb-2">🏛️</div>
              <h2 className="text-lg font-bold text-blue-800">{s.nom}</h2>
              <p className="text-gray-500 text-sm">Ville : {s.ville}</p>
              {s.adresse && (
                <p className="text-gray-400 text-sm">{s.adresse}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
