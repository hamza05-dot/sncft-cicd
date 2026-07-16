'use client';

import { useState } from 'react';
import { createPersonnel } from '@/lib/api';
import FormField from '@/components/FormField';

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

export default function PersonnelForm({ onSuccess, onClose }: Props) {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPersonnel({ nom, prenom, email, telephone, role });
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
        <FormField label="Nom" value={nom} onChange={setNom} required placeholder="Ben Ali" />
        <FormField label="Prénom" value={prenom} onChange={setPrenom} required placeholder="Mohamed" />
      </div>
      <FormField label="Email" type="email" value={email} onChange={setEmail} required placeholder="m.benali@sncft.tn" />
      <FormField label="Téléphone" value={telephone} onChange={setTelephone} placeholder="+216 XX XXX XXX" />
      <FormField label="Rôle" value={role} onChange={setRole} required options={[
        { value: 'Conducteur', label: 'Conducteur' },
        { value: 'Agent', label: 'Agent de gare' },
        { value: 'Technicien', label: 'Technicien' },
        { value: 'Responsable', label: 'Responsable' },
      ]} />
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
