'use client';

import { useState } from 'react';
import { updateStatutHoraire } from '@/lib/api';
import FormField from '@/components/FormField';
import { Horaire } from '@/types';

interface Props {
  horaire: Horaire;
  onSuccess: () => void;
  onClose: () => void;
}

export default function StatutHoraireForm({ horaire, onSuccess, onClose }: Props) {
  const [statut, setStatut] = useState(horaire.statut);
  const [retardMinutes, setRetardMinutes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateStatutHoraire(
        horaire.id,
        statut,
        retardMinutes ? parseInt(retardMinutes) : undefined
      );
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
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-800 font-medium">{horaire.train}</p>
        <p className="text-sm text-blue-600">{horaire.trajet}</p>
        <p className="text-sm text-gray-500">{horaire.heureDepart} → {horaire.heureArrivee}</p>
      </div>

      <FormField label="Nouveau statut" value={statut} onChange={setStatut} required options={[
        { value: "A l'heure", label: "A l'heure" },
        { value: 'Retard', label: 'Retard' },
        { value: 'Annule', label: 'Annule' },
      ]} />

      {statut === 'Retard' && (
        <FormField
          label="Retard en minutes"
          type="number"
          value={retardMinutes}
          onChange={setRetardMinutes}
          required
          placeholder="20"
        />
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition">
          Annuler
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 bg-blue-800 text-white py-2 rounded-lg hover:bg-blue-900 transition disabled:opacity-50">
          {loading ? 'Mise a jour...' : 'Confirmer'}
        </button>
      </div>
    </form>
  );
}
