// pages/CoursDetail.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { 
  CalendarToday, 
  Person, 
  School, 
  AccessTime,
  ArrowBack,
  Groups,
  Notes,
} from '@mui/icons-material';
import { useParams, Link } from 'react-router-dom';
import { coursApi, seanceCoursApi } from '../services/index';

const CoursDetail = () => {
  const { id } = useParams();
  const [cours, setCours] = useState(null);
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCoursDetails();
  }, [id]);

  const fetchCoursDetails = async () => {
    try {
      setLoading(true);
      const [coursResponse, seancesResponse] = await Promise.all([
        coursApi.getById(id),
        seanceCoursApi.getByCours(id),
      ]);
      setCours(coursResponse.data);
      setSeances(seancesResponse.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des détails du cours');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString('fr-FR');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          component={Link} 
          to="/cours" 
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Retour à la liste
        </Button>
      </Container>
    );
  }

  if (!cours) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Cours non trouvé</Alert>
        <Button 
          component={Link} 
          to="/cours" 
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Retour à la liste
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button 
        component={Link} 
        to="/cours" 
        startIcon={<ArrowBack />}
        sx={{ mb: 2 }}
      >
        Retour à la liste
      </Button>

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Chip label={cours.code} color="primary" />
              <Typography variant="h4" component="h1">
                {cours.titre}
              </Typography>
            </Box>
            <Typography color="text.secondary">
              {cours.description}
            </Typography>
          </Box>
          
          <Box textAlign="right">
            <Typography variant="h6" color="primary">
              {cours.credit || 0} crédits
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {cours.volumeHoraire ? `${cours.volumeHoraire} heures` : 'Volume horaire non défini'}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Informations principales */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informations du cours
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Période:</strong> {formatDate(cours.dateDebut)} - {formatDate(cours.dateFin)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccessTime fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Volume horaire:</strong> {cours.volumeHoraire || 0}h
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" alignItems="center" gap={1}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Formateur:</strong> {cours.formateur?.nom} {cours.formateur?.prenom}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  {cours.specialite && (
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <School fontSize="small" color="action" />
                        <Typography variant="body2">
                          <strong>Spécialité:</strong> {cours.specialite.nom} ({cours.specialite.code})
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Séances de cours */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Séances de cours
                </Typography>
                {seances.length > 0 ? (
                  <List>
                    {seances.map((seance) => (
                      <React.Fragment key={seance.id}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="subtitle1">
                                  {seance.type || 'Cours'}
                                </Typography>
                                <Chip 
                                  label={seance.salle || 'Salle non définie'} 
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography component="div" variant="body2">
                                  {formatDateTime(seance.dateDebut)} - {formatDateTime(seance.dateFin)}
                                </Typography>
                                {seance.description && (
                                  <Typography variant="body2" color="text.secondary">
                                    {seance.description}
                                  </Typography>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                    Aucune séance planifiée
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Statistiques et informations complémentaires */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Statistiques
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Groups color="primary" />
                  <Box>
                    <Typography variant="h5">
                      {cours.inscriptions?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Étudiants inscrits
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Notes color="secondary" />
                  <Box>
                    <Typography variant="h5">
                      {cours.notes?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Notes enregistrées
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {cours.inscriptions && cours.inscriptions.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Derniers inscrits
                  </Typography>
                  <List dense>
                    {cours.inscriptions.slice(0, 5).map((inscription, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={`${inscription.etudiant?.nom} ${inscription.etudiant?.prenom}`}
                          secondary={inscription.etudiant?.matricule}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default CoursDetail;