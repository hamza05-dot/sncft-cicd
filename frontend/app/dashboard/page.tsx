'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getHoraires, getTrains, getStations, getPersonnel, getMaintenances, getReservations, deleteHoraire, deleteTrain, deleteStation, deletePersonnel, deleteMaintenance } from '@/lib/api';
import { Horaire, Train, Station, Personnel, Maintenance, Reservation } from '@/types';
import StatutBadge from '@/components/StatutBadge';

export default function DashboardPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [horaires, setHoraires] = useState<Horaire[]>([]);
  const [trains, setTrains] = useState<Train[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    if (!loading && !isAdmin) router.push('/login');
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      getHoraires().then(setHoraires);
      getTrains().then(setTrains);
      getStations().then(setStations);
      getPersonnel().then(setPersonnel);
      getMaintenances().then(setMaintenances);
      getReservations().then(setReservations);
    }
  }, [isAdmin]);

  if (loading) return <div className="text-center py-20">Chargement...</div>;
  if (!isAdmin) return null;

  const stats = [
    { label: 'Trains', value: trains.length, icon: '🚂', color: 'bg-blue-500' },
    { label: 'Stations', value: stations.length, icon: '🏛️', color: 'bg-green-500' },
    { label: 'Horaires', value: horaires.length, icon: '🕐', color: 'bg-purple-500' },
    { label: 'Retards', value: horaires.filter(h => h.statut === 'Retard').length, icon: '⚠️', color: 'bg-yellow-500' },
    { label: 'Personnel', value: personnel.length, icon: '👷', color: 'bg-orange-500' },
    { label: 'Maintenances', value: maintenances.length, icon: '🔧', color: 'bg-red-500' },
    { label: 'Réservations', value: reservations.length, icon: '🎫', color: 'bg-pink-500' },
    { label: 'Ponctualité', value: horaires.length > 0 ? Math.round((horaires.filter(h => h.statut === "A l'heure").length / horaires.length) * 100) + '%' : '0%', icon: '✅', color: 'bg-teal-500' },
  ];

  const tabs = ['stats', 'horaires', 'trains', 'stations', 'personnel', 'maintenances', 'reservations'];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Dashboard Admin</h1>
          <p className="text-gray-500 text-sm">Connecté en tant que {user?.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
            <div className={`${s.color} text-white text-2xl w-12 h-12 rounded-lg flex items-center justify-center`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-gray-500 text-sm">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              activeTab === tab ? 'bg-blue-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-blue-800 mb-4">Résumé du système</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Taux de ponctualité</span>
              <span className="font-bold text-green-600">
                {horaires.length > 0 ? Math.round((horaires.filter(h => h.statut === "A l'heure").length / horaires.length) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Trains en retard</span>
              <span className="font-bold text-yellow-600">{horaires.filter(h => h.statut === 'Retard').length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Maintenances en cours</span>
              <span className="font-bold text-red-600">{maintenances.filter(m => m.statut === 'En cours').length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Réservations en attente</span>
              <span className="font-bold text-orange-600">{reservations.filter(r => r.statut === 'En attente').length}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Total personnel</span>
              <span className="font-bold text-blue-800">{personnel.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Horaires Tab */}
      {activeTab === 'horaires' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="p-3 text-left">Train</th>
                <th className="p-3 text-left">Trajet</th>
                <th className="p-3 text-left">Départ</th>
                <th className="p-3 text-left">Arrivée</th>
                <th className="p-3 text-left">Statut</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {horaires.map((h, i) => (
                <tr key={h.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3">{h.train}</td>
                  <td className="p-3">{h.trajet}</td>
                  <td className="p-3">{h.heureDepart}</td>
                  <td className="p-3">{h.heureArrivee}</td>
                  <td className="p-3"><StatutBadge statut={h.statut} /></td>
                  <td className="p-3">
                    <button onClick={() => deleteHoraire(h.id).then(() => setHoraires(horaires.filter(x => x.id !== h.id)))}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Trains Tab */}
      {activeTab === 'trains' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trains.map(t => (
            <div key={t.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-blue-800">{t.numero}</h2>
                  <p className="text-gray-500 text-sm">Type : {t.type}</p>
                  <p className="text-gray-500 text-sm">Capacité : {t.capacite} places</p>
                </div>
                <button onClick={() => deleteTrain(t.id).then(() => setTrains(trains.filter(x => x.id !== t.id)))}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stations Tab */}
      {activeTab === 'stations' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stations.map(s => (
            <div key={s.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-blue-800">{s.nom}</h2>
                  <p className="text-gray-500 text-sm">Ville : {s.ville}</p>
                </div>
                <button onClick={() => deleteStation(s.id).then(() => setStations(stations.filter(x => x.id !== s.id)))}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Personnel Tab */}
      {activeTab === 'personnel' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {personnel.map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-blue-800">{p.prenom} {p.nom}</h2>
                  <p className="text-gray-500 text-sm">Role : {p.role}</p>
                  <p className="text-gray-500 text-sm">{p.email}</p>
                  {p.telephone && <p className="text-gray-400 text-sm">{p.telephone}</p>}
                </div>
                <button onClick={() => deletePersonnel(p.id).then(() => setPersonnel(personnel.filter(x => x.id !== p.id)))}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Maintenances Tab */}
      {activeTab === 'maintenances' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="p-3 text-left">Train</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Début</th>
                <th className="p-3 text-left">Statut</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {maintenances.map((m, i) => (
                <tr key={m.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3">{m.train}</td>
                  <td className="p-3">{m.description}</td>
                  <td className="p-3">{m.type}</td>
                  <td className="p-3">{m.dateDebut}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      m.statut === 'Termine' ? 'bg-green-100 text-green-700' :
                      m.statut === 'En cours' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{m.statut}</span>
                  </td>
                  <td className="p-3">
                    <button onClick={() => deleteMaintenance(m.id).then(() => setMaintenances(maintenances.filter(x => x.id !== m.id)))}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reservations Tab */}
      {activeTab === 'reservations' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="p-3 text-left">Voyageur</th>
                <th className="p-3 text-left">Horaire</th>
                <th className="p-3 text-left">Places</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Statut</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r, i) => (
                <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3">{r.voyageur}</td>
                  <td className="p-3">#{r.horaire}</td>
                  <td className="p-3">{r.placesReservees}</td>
                  <td className="p-3">{r.dateReservation}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      r.statut === 'Confirmee' ? 'bg-green-100 text-green-700' :
                      r.statut === 'Annulee' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{r.statut}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
