// pages/GroupeList.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  AvatarGroup,
  LinearProgress,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Groups, Person, School } from '@mui/icons-material';
import { groupeApi } from '../services/index';

const GroupeList = () => {
  const [groupes, setGroupes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGroupes();
  }, []);

  const fetchGroupes = async () => {
    try {
      setLoading(true);
      const response = await groupeApi.getAll();
      // Pour chaque groupe, récupérer les étudiants
      const groupesWithEtudiants = await Promise.all(
        response.data.map(async (groupe) => {
          try {
            const etudiantsResponse = await groupeApi.getEtudiantsByGroupe(groupe.id);
            return {
              ...groupe,
              etudiants: etudiantsResponse.data,
            };
          } catch (err) {
            return { ...groupe, etudiants: [] };
          }
        })
      );
      setGroupes(groupesWithEtudiants);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des groupes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateOccupation = (groupe) => {
    if (!groupe.capaciteMax || groupe.capaciteMax === 0) return 0;
    return Math.round(((groupe.etudiants?.length || 0) / groupe.capaciteMax) * 100);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Groupes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {groupes.length} groupe{groupes.length !== 1 ? 's' : ''} disponibles
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {groupes.map((groupe) => {
            const occupation = calculateOccupation(groupe);
            const etudiantsCount = groupe.etudiants?.length || 0;
            
            return (
              <Grid item xs={12} sm={6} md={4} key={groupe.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Box
                        sx={{
                          backgroundColor: 'primary.light',
                          borderRadius: '50%',
                          width: 48,
                          height: 48,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Groups sx={{ color: 'primary.main', fontSize: 28 }} />
                      </Box>
                      <Box flex={1}>
                        <Typography variant="h6" component="div">
                          {groupe.nom}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Code: {groupe.code}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Barre de progression d'occupation */}
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          Occupation
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {etudiantsCount} / {groupe.capaciteMax || '∞'}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={occupation} 
                        color={occupation >= 100 ? 'error' : occupation >= 80 ? 'warning' : 'primary'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    {/* Liste des étudiants */}
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Étudiants du groupe
                      </Typography>
                      {etudiantsCount > 0 ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
                            {groupe.etudiants.map((etudiant) => (
                              <Avatar 
                                key={etudiant.id}
                                alt={`${etudiant.nom} ${etudiant.prenom}`}
                                sx={{ width: 32, height: 32, fontSize: 14 }}
                              >
                                {etudiant.nom?.charAt(0)}{etudiant.prenom?.charAt(0)}
                              </Avatar>
                            ))}
                          </AvatarGroup>
                          <Typography variant="body2" color="text.secondary">
                            {etudiantsCount} étudiant{etudiantsCount !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                          Aucun étudiant dans ce groupe
                        </Typography>
                      )}
                    </Box>

                    {/* Informations complémentaires */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                      <Chip 
                        icon={<Person />}
                        label={`${etudiantsCount} étudiant${etudiantsCount !== 1 ? 's' : ''}`}
                        size="small"
                        variant="outlined"
                      />
                      {groupe.capaciteMax && (
                        <Typography variant="caption" color="text.secondary">
                          {occupation}% occupé
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    </Container>
  );
};

export default GroupeList;