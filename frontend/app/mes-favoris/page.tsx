'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import StatutBadge from '@/components/StatutBadge';
import axios from 'axios';

interface Favori {
  id: number;
  dateAjout: string;
  horaire: {
    id: number;
    heureDepart: string;
    heureArrivee: string;
    train: string;
    trajet: string;
    statut: string;
    retardMinutes: number | null;
  };
}

export default function MesFavorisPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [favoris, setFavoris] = useState<Favori[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      Promise.all([
        axios.get('http://localhost:8080/api/favoris', { headers }),
        axios.get('http://localhost:8080/api/notifications', { headers }),
      ]).then(([favRes, notifRes]) => {
        setFavoris(favRes.data);
        setNotifications(notifRes.data);
        setLoadingData(false);
      });
    }
  }, [user]);
useEffect(() => {
    if (!user) return;

    let eventSource: EventSource | null = null;

    const subscribe = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/auth/mercure-token', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { token: mercureToken, topic } = res.data;

      document.cookie = `mercureAuthorization=${mercureToken}; path=/`;

      const url = new URL('http://localhost:3001/.well-known/mercure');
      url.searchParams.append('topic', topic);

      eventSource = new EventSource(url, { withCredentials: true });
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setNotifications((prev) => [
          { id: Date.now(), lu: false, ...data, dateCreation: new Date().toISOString() },
          ...prev,
        ]);
      };
    };

    subscribe();

    return () => {
      eventSource?.close();
    };
  }, [user]);
  const supprimerFavori = async (id: number) => {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:8080/api/favoris/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setFavoris(favoris.filter(f => f.id !== id));
  };

  const marquerLue = async (id: number) => {
    const token = localStorage.getItem('token');
    await axios.put(`http://localhost:8080/api/notifications/${id}/lire`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications(notifications.map(n => n.id === id ? { ...n, lu: true } : n));
  };

  if (loading || loadingData) return <div className="text-center py-20">Chargement...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-900 mb-8">⭐ Mes Trains Favoris</h1>

      {/* Notifications */}
      {notifications.filter(n => !n.lu).length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">
            🔔 Notifications ({notifications.filter(n => !n.lu).length} non lues)
          </h2>
          <div className="space-y-3">
            {notifications.filter(n => !n.lu).map(n => (
              <div key={n.id} className={`p-4 rounded-xl border flex justify-between items-center ${
                n.type === 'RETARD' ? 'bg-yellow-50 border-yellow-200' :
                n.type === 'ANNULATION' ? 'bg-red-50 border-red-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div>
                  <p className="font-medium text-gray-800">{n.message}</p>
                  <p className="text-sm text-gray-500">{n.dateCreation}</p>
                </div>
                <button
                  onClick={() => marquerLue(n.id)}
                  className="text-sm text-blue-600 hover:underline ml-4"
                >
                  Marquer lu
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favoris */}
      {favoris.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <div className="text-5xl mb-4">☆</div>
          <p className="text-gray-500">Vous n'avez pas encore de trains favoris.</p>
          <a href="/horaires" className="text-blue-800 font-semibold hover:underline mt-2 inline-block">
            Consulter les horaires
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {favoris.map(f => (
            <div key={f.id} className="bg-white rounded-xl shadow p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-bold text-blue-800">{f.horaire.train}</span>
                  <StatutBadge statut={f.horaire.statut} />
                  {f.horaire.retardMinutes && (
                    <span className="text-xs text-yellow-600">+{f.horaire.retardMinutes} min</span>
                  )}
                </div>
                <p className="text-gray-600">{f.horaire.trajet}</p>
                <p className="text-gray-500 text-sm">
                  {f.horaire.heureDepart} → {f.horaire.heureArrivee}
                </p>
              </div>
              <button
                onClick={() => supprimerFavori(f.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                Retirer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
