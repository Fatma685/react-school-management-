// components/PrivateRoute.js
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services';

const PrivateRoute = ({ children, roles = [] }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('PrivateRoute - Checking authentication...');
      
      // Vérifier l'authentification
      const authenticated = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();
      
      console.log('PrivateRoute - Authenticated:', authenticated);
      console.log('PrivateRoute - User:', currentUser);
      console.log('PrivateRoute - Required roles:', roles);
      
      setIsAuthenticated(authenticated);
      setUser(currentUser);
      setIsChecking(false);
    };

    checkAuth();
  }, [roles]);

  if (isChecking) {
    // Vous pouvez retourner un spinner ici
    return null;
  }

  // Si non authentifié, rediriger vers login
  if (!isAuthenticated || !user) {
    console.log('PrivateRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  // Vérifier les rôles si spécifiés
  if (roles.length > 0 && !roles.includes(user.role)) {
    console.log('PrivateRoute - Role not allowed, redirecting');
    
    // Rediriger vers le dashboard approprié
    if (user.role === 'ETUDIANT') {
      return <Navigate to="/etudiant/dashboard" />;
    } else if (user.role === 'FORMATEUR') {
      return <Navigate to="/formateur/dashboard" />;
    } else if (user.role === 'ADMIN') {
      // Admin peut être redirigé vers une page admin
      return <Navigate to="/admin/dashboard" />;
    }
    
    return <Navigate to="/login" />;
  }

  console.log('PrivateRoute - Access granted for user:', user.role);
  return children;
};

export default PrivateRoute;