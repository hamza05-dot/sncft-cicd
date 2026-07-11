'use client';

import { useEffect, useState } from 'react';
import { getHoraires } from '@/lib/api';
import { Horaire } from '@/types';
import StatutBadge from '@/components/StatutBadge';

export default function HorairesPage() {
  const [horaires, setHoraires] = useState<Horaire[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHoraires().then(data => {
      setHoraires(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-800 mb-6">🕐 Horaires des Trains</h1>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : horaires.length === 0 ? (
        <p className="text-gray-400">Aucun horaire disponible.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="p-3 text-left">Train</th>
                <th className="p-3 text-left">Trajet</th>
                <th className="p-3 text-left">Départ</th>
                <th className="p-3 text-left">Arrivée</th>
                <th className="p-3 text-left">Jours</th>
                <th className="p-3 text-left">Statut</th>
              </tr>
            </thead>
            <tbody>
              {horaires.map((h, i) => (
                <tr key={h.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3">{h.train}</td>
                  <td className="p-3">{h.trajet}</td>
                  <td className="p-3">{h.heureDepart}</td>
                  <td className="p-3">{h.heureArrivee}</td>
                  <td className="p-3">{h.jours}</td>
                  <td className="p-3"><StatutBadge statut={h.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
