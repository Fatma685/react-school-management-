// pages/EtudiantDetail.js
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
  Divider,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { 
  ArrowBack,
  Person,
  School,
  Group,
  Email,
  Phone,
  CalendarToday,
  Grade,
  Book,
} from '@mui/icons-material';
import { useParams, Link } from 'react-router-dom';
import { etudiantApi } from '../services/index';

const EtudiantDetail = () => {
  const { id } = useParams();
  const [etudiant, setEtudiant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchEtudiant();
  }, [id]);

  const fetchEtudiant = async () => {
    try {
      setLoading(true);
      const response = await etudiantApi.getById(id);
      setEtudiant(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données de l\'étudiant');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const calculateAge = (dateNaissance) => {
    if (!dateNaissance) return null;
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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
          to="/etudiants" 
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Retour à la liste
        </Button>
      </Container>
    );
  }

  if (!etudiant) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Étudiant non trouvé</Alert>
        <Button 
          component={Link} 
          to="/etudiants" 
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
        to="/etudiants" 
        startIcon={<ArrowBack />}
        sx={{ mb: 2 }}
      >
        Retour à la liste
      </Button>

      <Paper sx={{ p: 3 }}>
        {/* En-tête */}
        <Box display="flex" alignItems="center" gap={3} mb={4}>
          <Avatar 
            sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: 'primary.main',
              fontSize: '2rem'
            }}
          >
            {etudiant.nom?.charAt(0)}{etudiant.prenom?.charAt(0)}
          </Avatar>
          
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Typography variant="h3" component="h1">
                {etudiant.nom} {etudiant.prenom}
              </Typography>
              <Chip label={etudiant.matricule} color="primary" />
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Email fontSize="small" color="action" />
                  <Typography variant="body2">{etudiant.email}</Typography>
                </Box>
              </Grid>
              
              {etudiant.telephone && (
                <Grid item xs={6} md={3}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body2">{etudiant.telephone}</Typography>
                  </Box>
                </Grid>
              )}
              
              <Grid item xs={6} md={3}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2">
                    {formatDate(etudiant.dateNaissance)}
                    {etudiant.dateNaissance && ` (${calculateAge(etudiant.dateNaissance)} ans)`}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2">
                    Inscrit le {formatDate(etudiant.dateInscription)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab icon={<Person />} label="Informations" />
          <Tab icon={<Book />} label="Inscriptions" />
          <Tab icon={<Grade />} label="Notes" />
        </Tabs>

        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Informations académiques */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Informations académiques
                  </Typography>
                  
                  <Box mb={2}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <School fontSize="small" color="action" />
                      <Typography variant="subtitle2">Spécialité</Typography>
                    </Box>
                    {etudiant.specialite ? (
                      <Box pl={3}>
                        <Typography variant="body1" fontWeight="medium">
                          {etudiant.specialite.nom}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Code: {etudiant.specialite.code}
                        </Typography>
                        {etudiant.specialite.description && (
                          <Typography variant="body2" mt={1}>
                            {etudiant.specialite.description}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" pl={3}>
                        Non assigné
                      </Typography>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Group fontSize="small" color="action" />
                      <Typography variant="subtitle2">Groupe</Typography>
                    </Box>
                    {etudiant.groupe ? (
                      <Box pl={3}>
                        <Typography variant="body1" fontWeight="medium">
                          {etudiant.groupe.nom}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Code: {etudiant.groupe.code}
                        </Typography>
                        <Typography variant="body2">
                          Capacité: {etudiant.groupe.capaciteMax || 'Non définie'}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" pl={3}>
                        Non assigné
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Statistiques */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Statistiques
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {etudiant.inscriptions?.length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Cours inscrits
                        </Typography>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="secondary">
                          {etudiant.notes?.length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Notes obtenues
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && etudiant.inscriptions && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cours suivis
              </Typography>
              {etudiant.inscriptions.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Code</TableCell>
                        <TableCell>Cours</TableCell>
                        <TableCell>Formateur</TableCell>
                        <TableCell>Crédits</TableCell>
                        <TableCell>Date inscription</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {etudiant.inscriptions.map((inscription) => (
                        <TableRow key={inscription.id}>
                          <TableCell>
                            <Chip 
                              label={inscription.cours?.code} 
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {inscription.cours?.titre}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {inscription.cours?.formateur?.nom} {inscription.cours?.formateur?.prenom}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {inscription.cours?.credit || 0}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(inscription.dateInscription)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                  Aucune inscription à des cours
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 2 && etudiant.notes && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notes obtenues
              </Typography>
              {etudiant.notes.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Cours</TableCell>
                        <TableCell>Type d'évaluation</TableCell>
                        <TableCell>Note</TableCell>
                        <TableCell>Coefficient</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Appréciation</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {etudiant.notes.map((note) => (
                        <TableRow key={note.id}>
                          <TableCell>
                            <Typography variant="body2">
                              {note.cours?.titre}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={note.typeEvaluation || 'Examen'} 
                              size="small"
                              color="primary"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body1" 
                              fontWeight="bold"
                              color={note.valeur >= 10 ? 'success.main' : 'error.main'}
                            >
                              {note.valeur}/20
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {note.coefficient || 1}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(note.dateEvaluation)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {note.appreciation || '-'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                  Aucune note enregistrée
                </Typography>
              )}
            </CardContent>
          </Card>
        )}
      </Paper>
    </Container>
  );
};

export default EtudiantDetail;