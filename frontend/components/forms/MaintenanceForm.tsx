'use client';

import { useState } from 'react';
import { createMaintenance } from '@/lib/api';
import FormField from '@/components/FormField';
import { Train, Personnel } from '@/types';

interface Props {
  onSuccess: () => void;
  onClose: () => void;
  trains: Train[];
  personnel: Personnel[];
}

export default function MaintenanceForm({ onSuccess, onClose, trains, personnel }: Props) {
  const [description, setDescription] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [type, setType] = useState('');
  const [trainId, setTrainId] = useState('');
  const [personnelId, setPersonnelId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createMaintenance({
        description,
        dateDebut,
        type,
        trainId: parseInt(trainId),
        personnelId: personnelId ? parseInt(personnelId) : undefined,
        statut: 'Planifie',
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
      <FormField label="Description" value={description} onChange={setDescription} required placeholder="Révision moteur..." />
      <FormField label="Date de début" type="datetime-local" value={dateDebut} onChange={setDateDebut} required />
      <FormField label="Type" value={type} onChange={setType} required options={[
        { value: 'Preventive', label: 'Préventive' },
        { value: 'Corrective', label: 'Corrective' },
        { value: 'Urgente', label: 'Urgente' },
      ]} />
      <FormField label="Train" value={trainId} onChange={setTrainId} required options={
        trains.map(t => ({ value: String(t.id), label: t.numero + ' - ' + t.type }))
      } />
      <FormField label="Technicien responsable" value={personnelId} onChange={setPersonnelId} options={
        personnel.filter(p => p.role === 'Technicien').map(p => ({ value: String(p.id), label: p.prenom + ' ' + p.nom }))
      } />
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition">
          Annuler
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 bg-blue-800 text-white py-2 rounded-lg hover:bg-blue-900 transition disabled:opacity-50">
          {loading ? 'Création...' : 'Créer'}
        </button>
      </div>
    </form>
  );
}
