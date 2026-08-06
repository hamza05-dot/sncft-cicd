'use client';

import { useState } from 'react';
import { createTrajet } from '@/lib/api';
import FormField from '@/components/FormField';
import { Station } from '@/types';

interface Props {
  onSuccess: () => void;
  onClose: () => void;
  stations: Station[];
}

export default function TrajetForm({ onSuccess, onClose, stations }: Props) {
  const [distanceKm, setDistanceKm] = useState('');
  const [stationDepartId, setStationDepartId] = useState('');
  const [stationArriveeId, setStationArriveeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stationDepartId === stationArriveeId) {
      setError('La station de depart et arrivee doivent etre differentes');
      return;
    }
    setLoading(true);
    try {
      await createTrajet({
        distanceKm: parseFloat(distanceKm),
        stationDepartId: parseInt(stationDepartId),
        stationArriveeId: parseInt(stationArriveeId),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError('Erreur lors de la creation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
      <FormField label="Station Depart" value={stationDepartId} onChange={setStationDepartId} required
        options={stations.map(s => ({ value: String(s.id), label: s.nom + ' - ' + s.ville }))} />
      <FormField label="Station Arrivee" value={stationArriveeId} onChange={setStationArriveeId} required
        options={stations.map(s => ({ value: String(s.id), label: s.nom + ' - ' + s.ville }))} />
      <FormField label="Distance (km)" type="number" value={distanceKm} onChange={setDistanceKm} required placeholder="270" />
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition">
          Annuler
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 bg-blue-800 text-white py-2 rounded-lg hover:bg-blue-900 transition disabled:opacity-50">
          {loading ? 'Creation...' : 'Creer'}
        </button>
      </div>
    </form>
  );
}
