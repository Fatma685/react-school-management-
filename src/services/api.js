// services/api.js
import axios from 'axios';

// URL de votre backend Spring Boot
const API_URL = 'http://localhost:8080/api';

// Créer une instance axios avec configuration par défaut
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fonction pour vérifier si un token est un JWT valide
const isValidJWT = (token) => {
  if (!token) return false;
  // Un JWT valide a 3 parties séparées par des points
  const parts = token.split('.');
  return parts.length === 3;
};

// Fonction pour générer un JWT mock valide
export const generateMockJWT = (userData) => {
  const header = btoa(JSON.stringify({ 
    alg: 'HS256', 
    typ: 'JWT' 
  })).replace(/=/g, '');
  
  const payload = btoa(JSON.stringify({
    sub: userData.id.toString(),
    email: userData.email,
    role: userData.role,
    nom: userData.nom,
    prenom: userData.prenom,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24h
    ...userData // Ajouter les autres propriétés
  })).replace(/=/g, '');
  
  const signature = 'mock_signature_12345';
  
  return `${header}.${payload}.${signature}`;
};

// Intercepteur pour ajouter le token JWT automatiquement
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token');
    
    console.log('API Request - Current token:', token ? token.substring(0, 20) + '...' : 'No token');
    
    // Si le token n'est pas un JWT valide, en générer un mock
    if (token && !isValidJWT(token)) {
      console.log('Invalid JWT format, generating mock token...');
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          token = generateMockJWT(user);
          localStorage.setItem('token', token);
          console.log('Generated mock JWT token');
        } catch (e) {
          console.error('Error generating mock token:', e);
        }
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding Authorization header with token');
    } else {
      console.warn('No token available for request');
    }
    
    // Log pour débogage
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    console.log('Headers:', config.headers);
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => {
    console.log(`API Response ${response.status}: ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Authentication error (401/403), clearing storage');
      
      // Si c'est une erreur JWT, générer un nouveau token mock
      if (error.response?.data?.includes('JWT') || error.response?.data?.includes('token')) {
        console.log('JWT error detected, attempting to regenerate token...');
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            const newToken = generateMockJWT(user);
            localStorage.setItem('token', newToken);
            console.log('Regenerated JWT token');
            
            // Réessayer la requête avec le nouveau token
            const config = error.config;
            config.headers.Authorization = `Bearer ${newToken}`;
            return api.request(config);
          } catch (e) {
            console.error('Error regenerating token:', e);
          }
        }
      }
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Ne rediriger que si on n'est pas déjà sur la page de login
      if (!window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;