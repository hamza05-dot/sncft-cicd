'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getHoraires, getTrains, getStations, getPersonnel, getMaintenances, deleteHoraire, deleteTrain, deleteStation, deletePersonnel, deleteMaintenance, getTrajetsList } from '@/lib/api';
import { Horaire, Train, Station, Personnel, Maintenance, Trajet } from '@/types';
import StatutBadge from '@/components/StatutBadge';
import Modal from '@/components/Modal';
import PersonnelForm from '@/components/forms/PersonnelForm';
import MaintenanceForm from '@/components/forms/MaintenanceForm';
import HoraireForm from '@/components/forms/HoraireForm';
import TrainForm from '@/components/forms/TrainForm';
import StationForm from '@/components/forms/StationForm';
import TrajetForm from '@/components/forms/TrajetForm';
import StatutHoraireForm from '@/components/forms/StatutHoraireForm';

export default function DashboardPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [horaires, setHoraires] = useState<Horaire[]>([]);
  const [trains, setTrains] = useState<Train[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [showPersonnelForm, setShowPersonnelForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showHoraireForm, setShowHoraireForm] = useState(false);
  const [showTrainForm, setShowTrainForm] = useState(false);
  const [showStationForm, setShowStationForm] = useState(false);
  const [showTrajetForm, setShowTrajetForm] = useState(false);
  const [selectedHoraire, setSelectedHoraire] = useState<Horaire | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) router.push('/login');
  }, [loading, isAdmin, router]);

  const loadData = () => {
    getHoraires().then(setHoraires);
    getTrains().then(setTrains);
    getStations().then(setStations);
    getPersonnel().then(setPersonnel);
    getMaintenances().then(setMaintenances);
    getTrajetsList().then(setTrajets);
  };

  useEffect(() => {
    if (isAdmin) loadData();
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
    { label: 'Trajets', value: trajets.length, icon: '🗺️', color: 'bg-indigo-500' },
    { label: 'Ponctualite', value: horaires.length > 0 ? Math.round((horaires.filter(h => h.statut === "A l'heure").length / horaires.length) * 100) + '%' : '0%', icon: '✅', color: 'bg-teal-500' },
  ];

  const tabs = ['stats', 'horaires', 'trains', 'stations', 'trajets', 'personnel', 'maintenances'];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Dashboard Admin</h1>
          <p className="text-gray-500 text-sm">Connecte en tant que {user?.email}</p>
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
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              activeTab === tab ? 'bg-blue-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-blue-800 mb-4">Resume du systeme</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Taux de ponctualite</span>
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
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Total personnel</span>
              <span className="font-bold text-blue-800">{personnel.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Horaires Tab */}
      {activeTab === 'horaires' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowHoraireForm(true)}
              className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition">
              + Ajouter Horaire
            </button>
          </div>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="p-3 text-left">Train</th>
                  <th className="p-3 text-left">Trajet</th>
                  <th className="p-3 text-left">Depart</th>
                  <th className="p-3 text-left">Arrivee</th>
                  <th className="p-3 text-left">Statut</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {horaires.map((h, i) => (
                  <tr key={h.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3">{h.train}</td>
                    <td className="p-3">{h.trajet}</td>
                    <td className="p-3">{h.heureDepart}</td>
                    <td className="p-3">{h.heureArrivee}</td>
                    <td className="p-3">
                      <StatutBadge statut={h.statut} />
                      {h.retardMinutes && <span className="text-xs text-yellow-600 ml-1">+{h.retardMinutes}min</span>}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => setSelectedHoraire(h)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm">
                        Statut
                      </button>
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
        </div>
      )}

      {/* Trains Tab */}
      {activeTab === 'trains' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowTrainForm(true)}
              className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition">
              + Ajouter Train
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trains.map(t => (
              <div key={t.id} className="bg-white rounded-xl shadow p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-blue-800">{t.numero}</h2>
                    <p className="text-gray-500 text-sm">Type : {t.type}</p>
                    <p className="text-gray-500 text-sm">Capacite : {t.capacite} places</p>
                  </div>
                  <button onClick={() => deleteTrain(t.id).then(() => setTrains(trains.filter(x => x.id !== t.id)))}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stations Tab */}
      {activeTab === 'stations' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowStationForm(true)}
              className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition">
              + Ajouter Station
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stations.map(s => (
              <div key={s.id} className="bg-white rounded-xl shadow p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-blue-800">{s.nom}</h2>
                    <p className="text-gray-500 text-sm">Ville : {s.ville}</p>
                    {s.adresse && <p className="text-gray-400 text-sm">{s.adresse}</p>}
                  </div>
                  <button onClick={() => deleteStation(s.id).then(() => setStations(stations.filter(x => x.id !== s.id)))}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trajets Tab */}
      {activeTab === 'trajets' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowTrajetForm(true)}
              className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition">
              + Ajouter Trajet
            </button>
          </div>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="p-3 text-left">Depart</th>
                  <th className="p-3 text-left">Arrivee</th>
                  <th className="p-3 text-left">Distance</th>
                </tr>
              </thead>
              <tbody>
                {trajets.map((t, i) => (
                  <tr key={t.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3">{t.stationDepart}</td>
                    <td className="p-3">{t.stationArrivee}</td>
                    <td className="p-3">{t.distanceKm} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Personnel Tab */}
      {activeTab === 'personnel' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowPersonnelForm(true)}
              className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition">
              + Ajouter Personnel
            </button>
          </div>
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
        </div>
      )}

      {/* Maintenances Tab */}
      {activeTab === 'maintenances' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowMaintenanceForm(true)}
              className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition">
              + Ajouter Maintenance
            </button>
          </div>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="p-3 text-left">Train</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Debut</th>
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
        </div>
      )}

      {/* Modals */}
      {showPersonnelForm && (
        <Modal title="Ajouter Personnel" onClose={() => setShowPersonnelForm(false)}>
          <PersonnelForm onClose={() => setShowPersonnelForm(false)} onSuccess={() => getPersonnel().then(setPersonnel)} />
        </Modal>
      )}
      {showMaintenanceForm && (
        <Modal title="Ajouter Maintenance" onClose={() => setShowMaintenanceForm(false)}>
          <MaintenanceForm onClose={() => setShowMaintenanceForm(false)} onSuccess={() => getMaintenances().then(setMaintenances)} trains={trains} personnel={personnel} />
        </Modal>
      )}
      {showHoraireForm && (
        <Modal title="Ajouter Horaire" onClose={() => setShowHoraireForm(false)}>
          <HoraireForm onClose={() => setShowHoraireForm(false)} onSuccess={() => getHoraires().then(setHoraires)} trains={trains} trajets={trajets} />
        </Modal>
      )}
      {showTrainForm && (
        <Modal title="Ajouter Train" onClose={() => setShowTrainForm(false)}>
          <TrainForm onClose={() => setShowTrainForm(false)} onSuccess={() => getTrains().then(setTrains)} />
        </Modal>
      )}
      {showStationForm && (
        <Modal title="Ajouter Station" onClose={() => setShowStationForm(false)}>
          <StationForm onClose={() => setShowStationForm(false)} onSuccess={() => getStations().then(setStations)} />
        </Modal>
      )}
      {showTrajetForm && (
        <Modal title="Ajouter Trajet" onClose={() => setShowTrajetForm(false)}>
          <TrajetForm onClose={() => setShowTrajetForm(false)} onSuccess={() => getTrajetsList().then(setTrajets)} stations={stations} />
        </Modal>
      )}
      {selectedHoraire && (
        <Modal title="Changer Statut" onClose={() => setSelectedHoraire(null)}>
          <StatutHoraireForm
            horaire={selectedHoraire}
            onClose={() => setSelectedHoraire(null)}
            onSuccess={() => getHoraires().then(setHoraires)}
          />
        </Modal>
      )}
    </div>
  );
}
