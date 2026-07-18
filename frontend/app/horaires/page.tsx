'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getHoraires } from '@/lib/api';
import { Horaire } from '@/types';
import StatutBadge from '@/components/StatutBadge';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

export default function HorairesPage() {
  const [horaires, setHoraires] = useState<Horaire[]>([]);
  const [filtered, setFiltered] = useState<Horaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorisIds, setFavorisIds] = useState<number[]>([]);
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    getHoraires().then(data => {
      setHoraires(data);
      setFiltered(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      axios.get('http://localhost:8080/api/favoris', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setFavorisIds(res.data.map((f: any) => f.horaire.id));
      });
    }
  }, [user]);

  useEffect(() => {
    const depart = searchParams.get('depart');
    const arrivee = searchParams.get('arrivee');
    if (depart && arrivee) {
      setFiltered(horaires.filter(h => {
        const trajet = h.trajet;
        return trajet.includes(depart) || trajet.includes(arrivee);
      }));
    } else {
      setFiltered(horaires);
    }
  }, [searchParams, horaires]);

  const toggleFavori = async (horaireId: number) => {
    const token = localStorage.getItem('token');
    if (favorisIds.includes(horaireId)) {
      const res = await axios.get('http://localhost:8080/api/favoris', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const favori = res.data.find((f: any) => f.horaire.id === horaireId);
      if (favori) {
        await axios.delete(`http://localhost:8080/api/favoris/${favori.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFavorisIds(favorisIds.filter(id => id !== horaireId));
      }
    } else {
      await axios.post('http://localhost:8080/api/favoris',
        { horaireId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFavorisIds([...favorisIds, horaireId]);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-800 mb-6">🕐 Horaires des Trains</h1>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : filtered.length === 0 ? (
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
                {user && <th className="p-3 text-left">Favori</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((h, i) => (
                <tr key={h.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 font-medium">{h.train}</td>
                  <td className="p-3">{h.trajet}</td>
                  <td className="p-3">{h.heureDepart}</td>
                  <td className="p-3">{h.heureArrivee}</td>
                  <td className="p-3">{h.jours}</td>
                  <td className="p-3">
                    <StatutBadge statut={h.statut} />
                    {h.retardMinutes && (
                      <span className="text-xs text-yellow-600 ml-1">+{h.retardMinutes} min</span>
                    )}
                  </td>
                  {user && (
                    <td className="p-3">
                      <button
                        onClick={() => toggleFavori(h.id)}
                        className="text-2xl hover:scale-110 transition"
                      >
                        {favorisIds.includes(h.id) ? '⭐' : '☆'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!user && (
        <p className="text-center text-gray-500 mt-6">
          <a href="/login" className="text-blue-800 font-semibold hover:underline">Connectez-vous</a> pour sauvegarder vos trains favoris et recevoir des notifications.
        </p>
      )}
    </div>
  );
}
