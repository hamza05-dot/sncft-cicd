'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from '@/lib/api';

export default function ProfilPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }
    if (newPassword && newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Le nouveau mot de passe doit contenir au moins 8 caracteres' });
      return;
    }
    if (!currentPassword) {
      setMessage({ type: 'error', text: 'Entrez votre mot de passe actuel pour confirmer les changements' });
      return;
    }

    setLoading(true);
    try {
      const payload: { email?: string; newPassword?: string; currentPassword: string } = {
        currentPassword,
      };
      if (email && email !== user?.email) payload.email = email;
      if (newPassword) payload.newPassword = newPassword;

      await updateProfile(payload);
      setMessage({ type: 'success', text: 'Profil mis a jour avec succes' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message;
      setMessage({ type: 'error', text: apiMessage || "Erreur lors de la mise a jour du profil" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-8 text-center text-gray-500">
        Connectez-vous pour acceder a votre profil.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">👤</div>
          <h1 className="text-2xl font-bold text-blue-900">Mon Profil</h1>
          <p className="text-gray-500 text-sm mt-1">
            {user.roles?.includes('ROLE_ADMIN') && 'Compte administrateur'}
            {user.roles?.includes('ROLE_EMPLOYE') && 'Compte employe'}
            {!user.roles?.includes('ROLE_ADMIN') && !user.roles?.includes('ROLE_EMPLOYE') && 'Compte voyageur'}
          </p>
        </div>

        {message && (
          <div
            className={`px-4 py-3 rounded-lg mb-6 text-sm ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-medium text-gray-700 mb-3">Changer le mot de passe (optionnel)</p>
            <div className="space-y-3">
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirmer le nouveau mot de passe"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe actuel <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Requis pour confirmer les changements"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Mise a jour...' : 'Enregistrer les modifications'}
          </button>
        </form>
      </div>
    </div>
  );
}
