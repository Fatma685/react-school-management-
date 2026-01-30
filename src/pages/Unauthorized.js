import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { WarningAmber, Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
        }}
      >
        <WarningAmber sx={{ fontSize: 100, color: 'warning.main', mb: 3 }} />
        <Typography variant="h3" gutterBottom>
          Accès non autorisé
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </Typography>
        <Button
          variant="contained"
          startIcon={<Home />}
          onClick={() => navigate('/')}
          sx={{ mt: 3 }}
        >
          Retour à l'accueil
        </Button>
      </Box>
    </Container>
  );
};

export default Unauthorized;