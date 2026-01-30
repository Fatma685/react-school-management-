// pages/FormateurDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  School,
  Person,
  Class,
  CalendarToday,
  Groups,
  Assessment,
  Email,
  Phone,
  TrendingUp,
  Logout,
  AccessTime,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import { coursApi, seanceCoursApi, etudiantApi } from '../services/index';

const FormateurDashboard = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [mesCours, setMesCours] = useState([]);
  const [seancesAujourdhui, setSeancesAujourdhui] = useState([]);
  const [stats, setStats] = useState({
    totalEtudiants: 0,
    totalCours: 0,
    seancesSemaine: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Récupérer l'utilisateur courant
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      
      // Récupérer les données détaillées du formateur
      if (currentUser && currentUser.role === 'FORMATEUR') {
        const data = await authService.getUserData();
        setUserData(data);
        
        // Récupérer les cours du formateur
        if (data && data.id) {
          const mesCoursResponse = await coursApi.getByFormateur(data.id);
          setMesCours(mesCoursResponse.data);
          
          // Récupérer toutes les séances à venir
          const allSeances = await seanceCoursApi.getAVenir();
          
          // Filtrer les séances d'aujourd'hui pour ce formateur
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          const seancesToday = allSeances.data.filter(seance => {
            const seanceDate = new Date(seance.dateDebut);
            return (
              seanceDate >= today && 
              seanceDate < tomorrow &&
              seance.cours?.formateur?.id === data.id
            );
          });
          setSeancesAujourdhui(seancesToday);
          
          // Calculer les statistiques
          const totalEtudiants = await calculateTotalEtudiants(mesCoursResponse.data);
          const seancesSemaine = allSeances.data.filter(seance => {
            const seanceDate = new Date(seance.dateDebut);
            const weekFromNow = new Date();
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return seanceDate <= weekFromNow && seance.cours?.formateur?.id === data.id;
          }).length;
          
          setStats({
            totalEtudiants,
            totalCours: mesCoursResponse.data.length,
            seancesSemaine,
          });
        }
      }
      
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement du dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalEtudiants = async (coursList) => {
    try {
      let total = 0;
      for (const cours of coursList) {
        if (cours.id) {
          // Cette méthode hypothétique récupère les étudiants inscrits à un cours
          // Vous devrez adapter en fonction de vos APIs
          const etudiants = await etudiantApi.getByCours?.(cours.id);
          total += etudiants?.data?.length || 0;
        }
      }
      return total;
    } catch (err) {
      console.error('Erreur calcul étudiants:', err);
      return 0;
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* En-tête du dashboard */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'secondary.main' }}>
              {userData?.nom?.charAt(0)}{userData?.prenom?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1">
                Bonjour, {userData?.prenom} {userData?.nom}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Formateur • {userData?.specialite || 'Toutes spécialités'}
              </Typography>
              <Box display="flex" gap={2} mt={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Email fontSize="small" />
                  <Typography variant="body2">{userData?.email}</Typography>
                </Box>
                {userData?.telephone && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Phone fontSize="small" />
                    <Typography variant="body2">{userData?.telephone}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<Logout />}
            onClick={handleLogout}
          >
            Déconnexion
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Statistiques */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TrendingUp sx={{ verticalAlign: 'middle', mr: 1 }} />
                Mes statistiques
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Class color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Cours enseignés" 
                    secondary={
                      <Typography variant="h5" color="primary">
                        {stats.totalCours}
                      </Typography>
                    }
                  />
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemIcon>
                    <Groups color="secondary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Étudiants total" 
                    secondary={
                      <Typography variant="h5" color="secondary">
                        {stats.totalEtudiants}
                      </Typography>
                    }
                  />
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Séances cette semaine" 
                    secondary={
                      <Typography variant="h5" color="success">
                        {stats.seancesSemaine}
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Séances d'aujourd'hui */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CalendarToday sx={{ verticalAlign: 'middle', mr: 1 }} />
                Mes séances aujourd'hui
              </Typography>
              
              {seancesAujourdhui.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Heure</TableCell>
                        <TableCell>Cours</TableCell>
                        <TableCell>Salle</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Durée</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {seancesAujourdhui.map((seance) => {
                        const { time: startTime } = formatDateTime(seance.dateDebut);
                        const { time: endTime } = formatDateTime(seance.dateFin);
                        const start = new Date(seance.dateDebut);
                        const end = new Date(seance.dateFin);
                        const duration = Math.round((end - start) / (1000 * 60)); // en minutes
                        
                        return (
                          <TableRow key={seance.id}>
                            <TableCell>
                              <Typography variant="body2">
                                {startTime} - {endTime}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {seance.cours?.titre}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {seance.cours?.code}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={seance.salle || 'N/A'} 
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={seance.type || 'Cours'} 
                                size="small"
                                color="primary"
                              />
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <AccessTime fontSize="small" />
                                <Typography variant="body2">
                                  {duration} min
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                  Aucune séance prévue aujourd'hui
                </Typography>
              )}
              
              <Box textAlign="center" mt={2}>
                <Button 
                  component={Link} 
                  to="/seances" 
                  variant="outlined" 
                  startIcon={<CalendarToday />}
                >
                  Voir toutes les séances
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Mes cours */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Class sx={{ verticalAlign: 'middle', mr: 1 }} />
                Mes cours
              </Typography>
              
              {mesCours.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Code</TableCell>
                        <TableCell>Titre</TableCell>
                        <TableCell>Spécialité</TableCell>
                        <TableCell>Crédits</TableCell>
                        <TableCell>Période</TableCell>
                        <TableCell>Étudiants</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mesCours.map((cours) => (
                        <TableRow key={cours.id}>
                          <TableCell>
                            <Chip label={cours.code} size="small" color="primary" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1">
                              {cours.titre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {cours.description?.substring(0, 60)}...
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {cours.specialite ? (
                              <Chip 
                                label={cours.specialite.nom} 
                                size="small"
                                variant="outlined"
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Toutes
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1">
                              {cours.credit || 0}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(cours.dateDebut).toLocaleDateString('fr-FR')} - 
                              {new Date(cours.dateFin).toLocaleDateString('fr-FR')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Groups fontSize="small" />
                              <Typography variant="body1">
                                {cours.inscriptions?.length || 0}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Button 
                                component={Link}
                                to={`/formateur/cours/${cours.id}`}
                                size="small"
                                variant="outlined"
                              >
                                Voir
                              </Button>
                              <Button 
                                component={Link}
                                to={`/formateur/cours/${cours.id}/notes`}
                                size="small"
                                variant="contained"
                                color="secondary"
                              >
                                Notes
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                  Aucun cours assigné
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Liens rapides */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Outils de gestion
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={2}>
              <Card 
                component={Link}
                to="/formateur/cours"
                sx={{ 
                  textDecoration: 'none',
                  textAlign: 'center',
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Class sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="body2">Cours</Typography>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <Card 
                component={Link}
                to="/formateur/etudiants"
                sx={{ 
                  textDecoration: 'none',
                  textAlign: 'center',
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Person sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                <Typography variant="body2">Étudiants</Typography>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <Card 
                component={Link}
                to="/formateur/seances"
                sx={{ 
                  textDecoration: 'none',
                  textAlign: 'center',
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CalendarToday sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="body2">Séances</Typography>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <Card 
                component={Link}
                to="/formateur/notes/gestion"
                sx={{ 
                  textDecoration: 'none',
                  textAlign: 'center',
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Assessment sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="body2">Notes</Typography>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <Card 
                component={Link}
                to="/formateur/groupes"
                sx={{ 
                  textDecoration: 'none',
                  textAlign: 'center',
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Groups sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="body2">Groupes</Typography>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <Card 
                component={Link}
                to="/formateur/rapports"
                sx={{ 
                  textDecoration: 'none',
                  textAlign: 'center',
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <School sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                <Typography variant="body2">Rapports</Typography>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FormateurDashboard;