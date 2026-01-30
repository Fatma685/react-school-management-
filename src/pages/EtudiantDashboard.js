// pages/EtudiantDashboard.js
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
} from '@mui/material';
import {
  School,
  Person,
  Class,
  CalendarToday,
  Grade,
  Book,
  Email,
  Phone,
  CalendarMonth,
  Logout,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import { coursApi, seanceCoursApi } from '../services/index';

const EtudiantDashboard = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [coursInscrits, setCoursInscrits] = useState([]);
  const [seancesProchaines, setSeancesProchaines] = useState([]);
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
      
      // Récupérer les données détaillées de l'étudiant
      if (currentUser && currentUser.role === 'ETUDIANT') {
        const data = await authService.getUserData();
        setUserData(data);
        
        if (data && data.inscriptions) {
          // Récupérer les cours où l'étudiant est inscrit
          const coursIds = data.inscriptions.map(i => i.cours?.id).filter(Boolean);
          if (coursIds.length > 0) {
            const allCours = await coursApi.getAll();
            const mesCours = allCours.data.filter(c => coursIds.includes(c.id));
            setCoursInscrits(mesCours);
            
            // Récupérer les séances à venir pour ces cours
            const allSeances = await seanceCoursApi.getAVenir();
            const prochaines = allSeances.data
              .filter(s => coursIds.includes(s.cours?.id))
              .slice(0, 5); // Limiter à 5 séances
            setSeancesProchaines(prochaines);
          }
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

  const handleLogout = () => {
    authService.logout();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
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
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
              {userData?.nom?.charAt(0)}{userData?.prenom?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1">
                Bonjour, {userData?.prenom} {userData?.nom}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {userData?.matricule} • {userData?.specialite?.nom || 'Non assigné'}
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
        {/* Carte des informations académiques */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <School sx={{ verticalAlign: 'middle', mr: 1 }} />
                Informations académiques
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Spécialité" 
                    secondary={userData?.specialite?.nom || 'Non assigné'} 
                  />
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemIcon>
                    <Class />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Groupe" 
                    secondary={userData?.groupe?.nom || 'Non assigné'} 
                  />
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemIcon>
                    <CalendarMonth />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Date d'inscription" 
                    secondary={formatDate(userData?.dateInscription)} 
                  />
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemIcon>
                    <Book />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Cours suivis" 
                    secondary={`${coursInscrits.length} cours inscrits`} 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Carte des prochaines séances */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CalendarToday sx={{ verticalAlign: 'middle', mr: 1 }} />
                Prochaines séances
              </Typography>
              
              {seancesProchaines.length > 0 ? (
                <List>
                  {seancesProchaines.map((seance) => {
                    const date = new Date(seance.dateDebut);
                    return (
                      <ListItem key={seance.id}>
                        <ListItemIcon>
                          <CalendarToday color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={seance.cours?.titre}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                {date.toLocaleDateString('fr-FR')} à {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="text.secondary">
                                Salle: {seance.salle || 'Non définie'} • Type: {seance.type || 'Cours'}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                  Aucune séance à venir
                </Typography>
              )}
              
              <Box textAlign="center" mt={2}>
                <Button 
                  component={Link} 
                  to="/cours" 
                  variant="outlined" 
                  startIcon={<CalendarToday />}
                >
                  Voir toutes les séances
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Liens rapides */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Accès rapide
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={2}>
              <Card 
                component={Link}
                to="/etudiant/cours"
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
                to="/etudiant/etudiants"
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
                to="/etudiant/seances"
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
                to="/etudiant/mes-notes"
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
                <Grade sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="body2">Mes Notes</Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Card 
                component={Link}
                to="/etudiant/emploi-du-temps"
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
                <Grade sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="body2">Emploi Du temps</Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Card 
                component={Link}
                to="/etudiant/groupes"
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
                <School sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="body2">Groupes</Typography>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <Card 
                component={Link}
                to="/etudiant/specialites"
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
                <Book sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                <Typography variant="body2">Spécialités</Typography>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EtudiantDashboard;