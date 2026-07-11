interface Props {
  statut: string;
}

export default function StatutBadge({ statut }: Props) {
  const styles: Record<string, string> = {
    "A l'heure": 'bg-green-100 text-green-700',
    'Retard': 'bg-yellow-100 text-yellow-700',
    'Annulé': 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-sm font-medium ${styles[statut] ?? 'bg-gray-100 text-gray-700'}`}>
      {statut}
    </span>
  );
}
