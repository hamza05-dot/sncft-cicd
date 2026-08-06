'use client';

import { useState } from 'react';
import { createTrain } from '@/lib/api';
import FormField from '@/components/FormField';

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

export default function TrainForm({ onSuccess, onClose }: Props) {
  const [numero, setNumero] = useState('');
  const [type, setType] = useState('');
  const [capacite, setCapacite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTrain({ numero, type, capacite: parseInt(capacite) });
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
      <FormField label="Numero" value={numero} onChange={setNumero} required placeholder="TU-101" />
      <FormField label="Type" value={type} onChange={setType} required options={[
        { value: 'Express', label: 'Express' },
        { value: 'Regional', label: 'Regional' },
        { value: 'Intercity', label: 'Intercity' },
        { value: 'Banlieue', label: 'Banlieue' },
      ]} />
      <FormField label="Capacite (places)" type="number" value={capacite} onChange={setCapacite} required placeholder="250" />
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
