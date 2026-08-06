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

export interface Trajet {
  id: number;
  distanceKm: number;
  stationDepart: string;
  stationArrivee: string;
}

export interface Horaire {
  id: number;
  heureDepart: string;
  heureArrivee: string;
  jours: string;
  statut: string;
  retardMinutes: number | null;
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

export interface Personnel {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
}

export interface Maintenance {
  id: number;
  description: string;
  dateDebut: string;
  dateFin: string | null;
  statut: string;
  type: string;
  train: string;
  personnel: string | null;
}

export interface Reservation {
  id: number;
  dateReservation: string;
  statut: string;
  placesReservees: number;
  voyageur: string;
  horaire: number;
}
