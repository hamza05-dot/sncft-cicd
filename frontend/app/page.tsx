'use client';
import { useEffect, useState, useMemo } from 'react';
import { getLignes, getStationsByLigne, getHorairesByLigne, addFavori, deleteFavori, getFavoris } from '@/lib/api';
import { Ligne, LigneStation, LigneHoraire } from '@/types';

type TrainRow = {
  train: string;
  horaireIds: number[];
  times: Record<string, string>;
};

export default function Home() {
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [ligneId, setLigneId] = useState('');
  const [ligneStations, setLigneStations] = useState<LigneStation[]>([]);
  const [ligneHoraires, setLigneHoraires] = useState<LigneHoraire[]>([]);
  const [view, setView] = useState<'aller' | 'retour'>('aller');
  type FavoriEntry = { id: number; horaire: { id: number } };
  const [favoris, setFavoris] = useState<FavoriEntry[]>([]);

  useEffect(() => {
    getLignes().then(setLignes);
    getFavoris().then(setFavoris).catch(() => setFavoris([]));
  }, []);

  useEffect(() => {
    if (ligneId) {
      getStationsByLigne(Number(ligneId)).then((data: LigneStation[]) => {
        setLigneStations(data.sort((a, b) => a.ordre - b.ordre));
      });
      getHorairesByLigne(Number(ligneId)).then(setLigneHoraires);
    } else {
      setLigneStations([]);
      setLigneHoraires([]);
    }
    setView('aller');
  }, [ligneId]);

  // Ordre (position along the line) per station name, for direction detection
  const ordreByStation: Record<string, number> = {};
  ligneStations.forEach(s => { ordreByStation[s.nom] = s.ordre; });

  // Build one row per train, tagged with its direction (aller = increasing ordre,
  // retour = decreasing ordre), based on comparing its first and last stop.
  const trainNames = Array.from(new Set(ligneHoraires.map(h => h.train)));
  const allTrainRows: (TrainRow & { direction: 'aller' | 'retour' })[] = trainNames.map(train => {
    const legs = ligneHoraires
      .filter(h => h.train === train)
      .sort((a, b) => a.heureDepart.localeCompare(b.heureDepart));

    const times: Record<string, string> = {};
    const horaireIds: number[] = [];
    legs.forEach(leg => {
      horaireIds.push(leg.id);
      if (!(leg.stationDepart in times)) {
        times[leg.stationDepart] = leg.heureDepart;
      }
      times[leg.stationArrivee] = leg.heureArrivee;
    });

    const firstOrdre = ordreByStation[legs[0]?.stationDepart] ?? 0;
    const lastOrdre = ordreByStation[legs[legs.length - 1]?.stationArrivee] ?? 0;
    const direction: 'aller' | 'retour' = lastOrdre >= firstOrdre ? 'aller' : 'retour';

    return { train, horaireIds, times, direction };
  });

  const trainRows: TrainRow[] = allTrainRows.filter(r => r.direction === view);

  // Only show stations that actually have a stop among the current direction's trains
  const stationNamesWithStops = new Set(
    trainRows.flatMap(r => Object.keys(r.times))
  );
  let activeStations = ligneStations.filter(s => stationNamesWithStops.has(s.nom));
  // Retour trains travel the opposite way, so flip the columns too — otherwise
  // times decrease left-to-right, which reads as broken rather than reversed.
  if (view === 'retour') activeStations = [...activeStations].reverse();

  const favoritedTrains = useMemo(() => {
    const map: Record<string, number[]> = {};
    trainRows.forEach(row => {
      const matches = favoris.filter(f => row.horaireIds.includes(f.horaire.id));
      if (matches.length > 0) map[row.train] = matches.map(f => f.id);
    });
    return map;
  }, [trainRows, favoris]);

  const handleToggleFavori = async (row: TrainRow) => {
    const existingIds = favoritedTrains[row.train];
    if (existingIds) {
      try {
        await Promise.all(existingIds.map(favoriId => deleteFavori(favoriId)));
        setFavoris(prev => prev.filter(f => !existingIds.includes(f.id)));
      } catch (err: any) {
        console.error('deleteFavori failed:', err?.response?.status, err?.response?.data);
        alert("Impossible de retirer ce favori pour le moment.");
      }
      return;
    }
    try {
      const created = await Promise.all(row.horaireIds.map(id => addFavori(id)));
      const newEntries: FavoriEntry[] = created.map((c: { id: number }, idx: number) => ({
        id: c.id,
        horaire: { id: row.horaireIds[idx] },
      }));
      setFavoris(prev => [...prev, ...newEntries]);
    } catch (err: any) {
      console.error('addFavori failed:', err?.response?.status, err?.response?.data);
      if (err?.response?.status === 401) {
        alert('Connectez-vous pour ajouter un favori.');
      } else if (err?.response?.status === 400) {
        // Already favorited server-side but our local list was stale — refresh from source of truth
        getFavoris().then(setFavoris).catch(() => {});
      } else {
        alert(`Erreur lors de l'ajout du favori: ${err?.response?.data?.message || err?.message || 'inconnue'}`);
      }
    }
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-12 text-white text-center mb-8">
        <div className="text-5xl mb-4">🚆</div>
        <h1 className="text-4xl font-bold mb-2">Bienvenue sur SNCFT</h1>
        <p className="text-blue-200 text-lg mb-8">Consultez les horaires des trains tunisiens en temps réel</p>

        {/* Ligne picker */}
        <div className="max-w-4xl mx-auto">
          <p className="text-blue-100 text-sm font-medium mb-3 text-left">Choisissez votre ligne</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {lignes.map((l, i) => {
              const colors = ['bg-amber-400', 'bg-emerald-400', 'bg-rose-400', 'bg-sky-400', 'bg-violet-400', 'bg-teal-400'];
              const badgeColor = colors[i % colors.length];
              const isActive = String(l.id) === ligneId;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLigneId(String(l.id))}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl p-4 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                    isActive
                      ? 'ring-4 ring-blue-400 shadow-lg -translate-y-1'
                      : 'ring-1 ring-gray-200 shadow'
                  }`}
                >
                  {isActive && (
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center shadow">
                      ✓
                    </span>
                  )}
                  <div className={`${badgeColor} w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-inner`}>
                    🚆
                  </div>
                  <span className="text-gray-800 font-semibold text-sm text-center leading-tight">{l.nom}</span>
                  {l.code && (
                    <span className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">{l.code}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ligne timetable grid */}
      {ligneId && trainRows.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mb-8 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-blue-800">
              Horaires — {lignes.find(l => String(l.id) === ligneId)?.nom}
            </h2>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('aller')}
                className={`text-sm px-3 py-1 rounded-md transition ${
                  view === 'aller' ? 'bg-white text-blue-800 shadow font-medium' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Aller
              </button>
              <button
                onClick={() => setView('retour')}
                className={`text-sm px-3 py-1 rounded-md transition ${
                  view === 'retour' ? 'bg-white text-blue-800 shadow font-medium' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Retour
              </button>
            </div>
          </div>
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2 pr-4"></th>
                <th className="py-2 pr-4">Train</th>
                {activeStations.map(s => (
                  <th key={s.id} className="py-2 pr-4 whitespace-nowrap">{s.nom}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trainRows.map(row => (
                <tr key={row.train} className="border-b border-gray-100 hover:bg-blue-50 transition">
                  <td className="py-2 pr-4">
                    <button
                      onClick={() => handleToggleFavori(row)}
                      title={favoritedTrains[row.train] ? 'Retirer des favoris' : 'Ajouter aux favoris pour être notifié en cas de retard'}
                      className="text-xl transition"
                    >
                      {favoritedTrains[row.train] ? '⭐' : '☆'}
                    </button>
                  </td>
                  <td className="py-2 pr-4 font-medium whitespace-nowrap">{row.train}</td>
                  {activeStations.map(s => (
                    <td key={s.id} className="py-2 pr-4 whitespace-nowrap">
                      {row.times[s.nom] ?? <span className="text-gray-300">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-3">⭐ Ajoutez un train à vos favoris pour être notifié en cas de retard ou d'annulation. Cliquez à nouveau pour retirer.</p>
        </div>
      )}

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
