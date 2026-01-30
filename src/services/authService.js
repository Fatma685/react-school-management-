// services/authService.js
import api, { generateMockJWT } from './api';

const authService = {
  // Vérifier et corriger le token si nécessaire
  validateToken: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      return false;
    }
    
    // Vérifier si le token est un JWT valide
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('Token is not valid JWT, regenerating...');
      try {
        const user = JSON.parse(userStr);
        const newToken = generateMockJWT(user);
        localStorage.setItem('token', newToken);
        return true;
      } catch (error) {
        console.error('Error regenerating token:', error);
        return false;
      }
    }
    
    return true;
  },

  // Récupérer l'utilisateur courant
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
    }
    return null;
  },
 hasRole(requiredRole) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // L'admin a tous les rôles
    if (user.role === 'ADMIN') return true;
    
    return user.role === requiredRole;
  },
  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = authService.getCurrentUser();
    return token && user && authService.validateToken();
  },
isLoggedIn() {
    return !!this.getCurrentUser() && !!this.getToken();
  },
  // Déconnexion
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
login(userData, token) {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  },
  getToken() {
    return localStorage.getItem('token');
  },
  // Simuler la connexion
  simulateLogin: (role, userData) => {
    const token = generateMockJWT(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log(`Simulated ${role} login with JWT token`);
    return { token, user: userData };
  },

  // Récupérer les données de l'utilisateur
  getUserData: async () => {
    const user = authService.getCurrentUser();
    
    if (!user) return null;
    
    // Pour le développement, retourner les données du localStorage
    // En production, vous décommenteriez l'appel API
    return user;
  }
};

export default authService;