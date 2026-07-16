import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajoute le token JWT automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const register = async (email: string, password: string, roles: string[]) => {
  const res = await api.post('/auth/register', { email, password, roles });
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

// Data
export const getHoraires = async () => {
  const res = await api.get('/horaires');
  return res.data;
};

export const getTrains = async () => {
  const res = await api.get('/trains');
  return res.data;
};

export const getStations = async () => {
  const res = await api.get('/stations');
  return res.data;
};

export const getTrajets = async () => {
  const res = await api.get('/trajets');
  return res.data;
};

// Admin CRUD
export const createHoraire = async (data: object) => {
  const res = await api.post('/horaires', data);
  return res.data;
};

export const updateHoraire = async (id: number, data: object) => {
  const res = await api.put(`/horaires/${id}`, data);
  return res.data;
};

export const deleteHoraire = async (id: number) => {
  const res = await api.delete(`/horaires/${id}`);
  return res.data;
};

export const createTrain = async (data: object) => {
  const res = await api.post('/trains', data);
  return res.data;
};

export const deleteTrain = async (id: number) => {
  const res = await api.delete(`/trains/${id}`);
  return res.data;
};

export const createStation = async (data: object) => {
  const res = await api.post('/stations', data);
  return res.data;
};

export const deleteStation = async (id: number) => {
  const res = await api.delete(`/stations/${id}`);
  return res.data;
};
// Personnel
export const getPersonnel = async () => {
  const res = await api.get('/personnel');
  return res.data;
};

export const createPersonnel = async (data: object) => {
  const res = await api.post('/personnel', data);
  return res.data;
};

export const deletePersonnel = async (id: number) => {
  const res = await api.delete(`/personnel/${id}`);
  return res.data;
};

// Maintenance
export const getMaintenances = async () => {
  const res = await api.get('/maintenances');
  return res.data;
};

export const createMaintenance = async (data: object) => {
  const res = await api.post('/maintenances', data);
  return res.data;
};

export const deleteMaintenance = async (id: number) => {
  const res = await api.delete(`/maintenances/${id}`);
  return res.data;
};

// Reservation
export const getReservations = async () => {
  const res = await api.get('/reservations');
  return res.data;
};

export const createReservation = async (data: object) => {
  const res = await api.post('/reservations', data);
  return res.data;
};
export const getTrajetsList = async () => {
  const res = await api.get('/trajets');
  return res.data;
};
