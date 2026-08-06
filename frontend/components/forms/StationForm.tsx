'use client';

import { useState } from 'react';
import { createStation } from '@/lib/api';
import FormField from '@/components/FormField';

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

export default function StationForm({ onSuccess, onClose }: Props) {
  const [nom, setNom] = useState('');
  const [ville, setVille] = useState('');
  const [adresse, setAdresse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createStation({ nom, ville, adresse });
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
      <FormField label="Nom de la gare" value={nom} onChange={setNom} required placeholder="Gare de Tunis" />
      <FormField label="Ville" value={ville} onChange={setVille} required options={[
        { value: 'Tunis', label: 'Tunis' },
        { value: 'Sfax', label: 'Sfax' },
        { value: 'Sousse', label: 'Sousse' },
        { value: 'Nabeul', label: 'Nabeul' },
        { value: 'Bizerte', label: 'Bizerte' },
        { value: 'Gabes', label: 'Gabes' },
        { value: 'Monastir', label: 'Monastir' },
        { value: 'Mahdia', label: 'Mahdia' },
      ]} />
      <FormField label="Adresse" value={adresse} onChange={setAdresse} placeholder="Avenue Habib Bourguiba" />
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
