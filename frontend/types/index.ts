export interface Station {
  id: number;
  nom: string;
  ville: string;
  adresse: string;
}

export interface Train {
  id: number;
  numero: string;
  type: string;
  capacite: number;
}

export interface Horaire {
  id: number;
  heureDepart: string;
  heureArrivee: string;
  jours: string;
  statut: string;
  train: string;
  trajet: string;
}

export interface Modification {
  id: number;
  dateModif: string;
  ancienneHeure: string;
  nouvelleHeure: string;
  motif: string;
  type: string;
  horaireId: number;
}
