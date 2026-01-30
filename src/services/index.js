// services/index.js
import api, { generateMockJWT } from './api';
import authService from './authService';

// Cours API
export const coursApi = {
  getAll: () => api.get('/cours'),
  getById: (id) => api.get(`/cours/${id}`),
  getByCode: (code) => api.get(`/cours/code/${code}`),
  getByFormateur: (formateurId) => api.get(`/cours/formateur/${formateurId}`),
  getBySpecialite: (specialiteId) => api.get(`/cours/specialite/${specialiteId}`),
};

// Étudiant API
export const etudiantApi = {
  getAll: () => api.get('/etudiants'),
  getById: (id) => api.get('/etudiants/${id}'),
  getByMatricule: (matricule) => api.get('/etudiants/matricule/${matricule}'),
  getBySpecialite: (specialiteId) => api.get('/etudiants/specialite/${specialiteId}'),
  getByGroupe: (groupeId) => api.get('/etudiants/groupe/${groupeId}'),
  getByEmail: (email) => api.get('/etudiants/email/${email}'),
};

// Groupe API
export const groupeApi = {
  getAll: () => api.get('/groupes'),
  getById: (id) => api.get('/groupes/${id}'),
  getByCode: (code) => api.get('/groupes/code/${code}'),
  getEtudiantsByGroupe: (id) => api.get('/groupes/${id}/etudiants'),
};

// Spécialité API
export const specialiteApi = {
  getAll: () => api.get('/specialites'),
  getById: (id) => api.get(`/specialites/${id}`),
  getByCode: (code) => api.get(`/specialites/code/${code}`),
  getCoursBySpecialite: (id) => api.get(`/specialites/${id}/cours`),
  getEtudiantsBySpecialite: (id) => api.get(`/specialites/${id}/etudiants`),
};

// Séance Cours API
export const seanceCoursApi = {
  getAll: () => api.get('/seances-cours'),
  getById: (id) => api.get('/seances-cours/${id}'),
  getByCours: (coursId) => api.get('/seances-cours/cours/${coursId}'),
  getByFormateur: (formateurId) => api.get('/seances-cours/formateur/${formateurId}'),
  getAVenir: () => api.get('/seances-cours/a-venir'),
};

export const noteApi = {
  getAll: () => api.get('/notes'),
  getById: (id) => api.get('/notes/${id}'),
  getByEtudiantId: (etudiantId) => api.get('/notes/etudiant/${etudiantId}'),
  getByCoursId: (coursId) => api.get('/notes/cours/${coursId}'),
  getMesNotes: () => api.get('/notes/mes-notes'), 
};

export { api, authService, generateMockJWT };

export default {
  api,
  authService,
  coursApi,
  etudiantApi,
  groupeApi,
  specialiteApi,
  seanceCoursApi,
};