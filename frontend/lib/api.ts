const API_URL = 'http://localhost:8080/api';

export async function getHoraires() {
  const res = await fetch(`${API_URL}/horaires`);
  return res.json();
}

export async function getTrains() {
  const res = await fetch(`${API_URL}/trains`);
  return res.json();
}

export async function getStations() {
  const res = await fetch(`${API_URL}/stations`);
  return res.json();
}

export async function getTrajets() {
  const res = await fetch(`${API_URL}/trajets`);
  return res.json();
}

