'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

interface Planning {
  id: number;
  date: string;
  horaire: {
    id: number;
    heureDepart: string;
    heureArrivee: string;
    train: string;
    trajet: string;
    statut: string;
  };
}

interface Maintenance {
  id: number;
  description: string;
  dateDebut: string;
  dateFin: string | null;
  statut: string;
  type: string;
  train: string;
}

export default function EspaceEmployePage() {
  const { user, loading, isEmploye } = useAuth();
  const router = useRouter();
  const [planning, setPlanning] = useState<Planning[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [activeTab, setActiveTab] = useState('planning');

  useEffect(() => {
    if (!loading && !isEmploye && !user?.roles?.includes('ROLE_EMPLOYE')) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      axios.get('http://localhost:8080/api/horaires-conducteurs/mon-planning', { headers })
        .then(res => setPlanning(res.data))
        .catch(err => console.error(err));

      axios.get('http://localhost:8080/api/maintenances', { headers })
        .then(res => setMaintenances(res.data))
        .catch(err => console.error(err));
    }
  }, [user]);

  const updateStatutMaintenance = async (id: number, statut: string) => {
    const token = localStorage.getItem('token');
    await axios.put(`http://localhost:8080/api/maintenances/${id}`,
      { statut },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setMaintenances(maintenances.map(m => m.id === id ? { ...m, statut } : m));
  };

  if (loading) return <div className="text-center py-20">Chargement...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-900">👷 Espace Employé</h1>
        <p className="text-gray-500 text-sm">Bienvenue, {user?.email}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['planning', 'maintenances'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              activeTab === tab ? 'bg-blue-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}>
            {tab === 'planning' ? '📅 Mon Planning' : '🔧 Mes Maintenances'}
          </button>
        ))}
      </div>

      {/* Planning Tab */}
      {activeTab === 'planning' && (
        <div>
          {planning.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <p className="text-gray-400">Aucun planning assigné pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {planning.map(p => (
                <div key={p.id} className="bg-white rounded-xl shadow p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">📅 {p.date}</p>
                      <h2 className="text-lg font-bold text-blue-800">{p.horaire.train}</h2>
                      <p className="text-gray-600">{p.horaire.trajet}</p>
                      <p className="text-gray-500 text-sm">
                        {p.horaire.heureDepart} → {p.horaire.heureArrivee}
                      </p>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        p.horaire.statut === "A l'heure" ? 'bg-green-100 text-green-700' :
                        p.horaire.statut === 'Retard' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {p.horaire.statut}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Maintenances Tab */}
      {activeTab === 'maintenances' && (
        <div>
          {maintenances.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <p className="text-gray-400">Aucune maintenance assignée.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {maintenances.map(m => (
                <div key={m.id} className="bg-white rounded-xl shadow p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-blue-800">{m.train}</h2>
                      <p className="text-gray-600">{m.description}</p>
                      <p className="text-gray-500 text-sm">Type : {m.type}</p>
                      <p className="text-gray-500 text-sm">Début : {m.dateDebut}</p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        m.statut === 'Termine' ? 'bg-green-100 text-green-700' :
                        m.statut === 'En cours' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {m.statut}
                      </span>
                      {m.statut !== 'Termine' && (
                        <select
                          onChange={e => updateStatutMaintenance(m.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded-lg px-2 py-1"
                          defaultValue=""
                        >
                          <option value="" disabled>Changer statut</option>
                          <option value="En cours">En cours</option>
                          <option value="Termine">Terminé</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
