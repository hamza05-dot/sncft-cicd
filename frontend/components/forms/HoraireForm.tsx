'use client';

import { useState } from 'react';
import { createHoraire } from '@/lib/api';
import FormField from '@/components/FormField';
import { Train } from '@/types';

interface Trajet {
  id: number;
  stationDepart: string;
  stationArrivee: string;
}

interface Props {
  onSuccess: () => void;
  onClose: () => void;
  trains: Train[];
  trajets: Trajet[];
}

export default function HoraireForm({ onSuccess, onClose, trains, trajets }: Props) {
  const [heureDepart, setHeureDepart] = useState('');
  const [heureArrivee, setHeureArrivee] = useState('');
  const [jours, setJours] = useState('');
  const [trainId, setTrainId] = useState('');
  const [trajetId, setTrajetId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createHoraire({
        heureDepart,
        heureArrivee,
        jours,
        statut: "A l'heure",
        trainId: parseInt(trainId),
        trajetId: parseInt(trajetId),
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Heure depart" type="time" value={heureDepart} onChange={setHeureDepart} required />
        <FormField label="Heure arrivee" type="time" value={heureArrivee} onChange={setHeureArrivee} required />
      </div>
      <FormField label="Jours" value={jours} onChange={setJours} required options={[
        { value: 'Lun-Ven', label: 'Lundi - Vendredi' },
        { value: 'Lun-Sam', label: 'Lundi - Samedi' },
        { value: 'Tous les jours', label: 'Tous les jours' },
        { value: 'Weekend', label: 'Weekend' },
      ]} />
      <FormField label="Train" value={trainId} onChange={setTrainId} required options={
        trains.map(t => ({ value: String(t.id), label: t.numero + ' - ' + t.type }))
      } />
      <FormField label="Trajet" value={trajetId} onChange={setTrajetId} required options={
        trajets.map(t => ({ value: String(t.id), label: t.stationDepart + ' -> ' + t.stationArrivee }))
      } />
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
