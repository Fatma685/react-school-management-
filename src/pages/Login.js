// pages/Login.js - CORRIGER LA GÉNÉRATION DU TOKEN
import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
} from '@mui/material';
import { School, Person, LockOpen } from '@mui/icons-material';

const Login = () => {
  // Fonction pour générer un token JWT mock VALIDE
  const generateMockJWT = (role, userId) => {
    // Structure d'un JWT mock valide : header.payload.signature
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: userId.toString(),
      email: `${role}@school.com`,
      role: role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24h
      nom: role === 'ETUDIANT' ? 'Dupont' : 'Martin',
      prenom: role === 'ETUDIANT' ? 'Jean' : 'Pierre'
    }));
    const signature = 'mock_signature_12345';
    
    return `${header}.${payload}.${signature}`;
  };

  const handleLoginRedirect = (role) => {
    // Simuler un callback d'authentification réussie avec JWT valide
    if (role === 'ETUDIANT') {
      const mockUser = {
        id: 1,
        email: 'etudiant1@school.com',
        nom: 'Durand',
        prenom: 'Pierre',
        role: 'ETUDIANT',
        matricule: 'ETU001'
      };
      
      // Utiliser un token JWT valide
      const mockToken = generateMockJWT('ETUDIANT', 1);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      window.location.href = '/etudiant/dashboard';
    } else if (role === 'FORMATEUR') {
      const mockUser = {
        id: 2,
        email: 'formateur2@school.com',
        nom: 'Martin',
        prenom: 'Pierre',
        role: 'FORMATEUR',
        specialite: 'Informatique'
      };
      
      // Utiliser un token JWT valide
      const mockToken = generateMockJWT('FORMATEUR', 2);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      window.location.href = '/formateur/dashboard';
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 3 }}>
          <School sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Système de Gestion Scolaire
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Veuillez vous connecter pour accéder à l'application
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Mode développement - Utilisation de tokens JWT mock
        </Alert>

        {/* Boutons de test pour le développement */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Développement - Connexion rapide:
          </Typography>
          
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Person />}
              onClick={() => handleLoginRedirect('ETUDIANT')}
              fullWidth
            >
              Se connecter en tant qu'Étudiant
            </Button>
            
            <Button
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<Person />}
              onClick={() => handleLoginRedirect('FORMATEUR')}
              fullWidth
            >
              Se connecter en tant que Formateur
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              size="large"
              startIcon={<LockOpen />}
              onClick={() => {
                // Redirection vers le login Thymeleaf réel
                window.location.href = 'http://localhost:8080/login';
              }}
              fullWidth
            >
              Page de login réelle (Thymeleaf)
            </Button>
          </Box>
        </Box>

        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Note :</strong> Pour les tests avec le backend, assurez-vous que les tokens JWT sont valides.
            Le backend Spring Boot exige des tokens JWT bien formés.
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
};

export default Login;