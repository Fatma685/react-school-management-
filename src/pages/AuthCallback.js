// pages/AuthCallback.js
import React, { useEffect } from 'react';
import {
  Container,
  Box,
  CircularProgress,
  Typography,
  Alert,
} from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';
import authService from '../services/authService';

const AuthCallback = () => {
  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Gérer le callback d'authentification
        const user = authService.handleAuthCallback();
        
        if (user) {
          // Attendre un peu pour que l'utilisateur voie le message de succès
          setTimeout(() => {
            if (user.role === 'ETUDIANT') {
              window.location.href = '/etudiant/dashboard';
            } else if (user.role === 'FORMATEUR') {
              window.location.href = '/formateur/dashboard';
            } else {
              window.location.href = '/login';
            }
          }, 1500);
        } else {
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      } catch (error) {
        console.error('Erreur lors de l\'authentification:', error);
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    };

    handleAuth();
  }, []);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <Box sx={{ position: 'relative', mb: 3 }}>
          <CircularProgress size={80} />
          <CheckCircle
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 40,
              color: 'success.main',
            }}
          />
        </Box>
        
        <Typography variant="h5" gutterBottom>
          Authentification en cours...
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Vous allez être redirigé vers votre dashboard dans un instant.
        </Typography>
        
        <Alert 
          severity="info" 
          sx={{ mt: 2, width: '100%' }}
          icon={<Error />}
        >
          Si la redirection ne se fait pas automatiquement, 
          <a href="/login" style={{ marginLeft: '5px' }}>cliquez ici</a>.
        </Alert>
      </Box>
    </Container>
  );
};

export default AuthCallback;