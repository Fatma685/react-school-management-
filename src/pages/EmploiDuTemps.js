// pages/EmploiDuTemps.js
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
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  CalendarToday,
  ArrowBackIos,
  ArrowForwardIos,
  Today,
  Event,
  ViewWeek,
  ViewDay,
  LocationOn,
  Person,
  School,
  AccessTime,
  Info,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { seanceCoursApi } from '../services/api';

// Données de démonstration pour l'emploi du temps
const generateMockSchedule = () => {
  const today = new Date();
  const days = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.toLocaleDateString('fr-FR', { weekday: 'long' });
    const dayNumber = date.getDate();
    const month = date.toLocaleDateString('fr-FR', { month: 'long' });
    
    const seances = [];
    
    // Générer 2-3 séances par jour
    const numSeances = Math.floor(Math.random() * 2) + 2;
    
    for (let j = 0; j < numSeances; j++) {
      const startHour = 8 + j * 3;
      const endHour = startHour + 2;
      
      const coursList = [
        { id: 1, code: 'MAT101', titre: 'Mathématiques', formateur: { nom: 'Martin', prenom: 'Pierre' } },
        { id: 2, code: 'INF101', titre: 'Programmation', formateur: { nom: 'Dubois', prenom: 'Marie' } },
        { id: 3, code: 'PHY101', titre: 'Physique', formateur: { nom: 'Leroy', prenom: 'Jean' } },
        { id: 4, code: 'ANG101', titre: 'Anglais', formateur: { nom: 'Smith', prenom: 'Sarah' } },
      ];
      
      const cours = coursList[Math.floor(Math.random() * coursList.length)];
      const type = ['COURS', 'TD', 'TP'][Math.floor(Math.random() * 3)];
      const salles = ['A101', 'B202', 'C303', 'D404'];
      const salle = salles[Math.floor(Math.random() * salles.length)];
      
      seances.push({
        id: `${i}-${j}`,
        cours,
        type,
        salle,
        dateDebut: `${date.toISOString().split('T')[0]}T${startHour.toString().padStart(2, '0')}:00:00`,
        dateFin: `${date.toISOString().split('T')[0]}T${endHour.toString().padStart(2, '0')}:00:00`,
        description: `Séance de ${cours.titre}`,
      });
    }
    
    days.push({
      id: i,
      date,
      dayOfWeek,
      dayNumber,
      month,
      seances,
    });
  }
  
  return days;
};

const EmploiDuTemps = () => {
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState([]);
  const [selectedSeance, setSelectedSeance] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Récupérer l'utilisateur courant
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      
      // Simulation de chargement de l'emploi du temps
      // En production, vous appelleriez une API comme : seanceCoursApi.getByEtudiant(user.id)
      setTimeout(() => {
        setSchedule(generateMockSchedule());
        setError(null);
        setLoading(false);
      }, 800);
      
    } catch (err) {
      setError('Erreur lors du chargement de l\'emploi du temps');
      console.error(err);
      setLoading(false);
    }
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleSeanceClick = (seance) => {
    setSelectedSeance(seance);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedSeance(null);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'COURS': return 'primary';
      case 'TD': return 'secondary';
      case 'TP': return 'success';
      case 'EXAMEN': return 'error';
      default: return 'default';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateLong = (date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateShort = (date) => {
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short'
    });
  };

  const getWeekDates = () => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour lundi
    const monday = new Date(start.setDate(diff));
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const getSeancesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const daySchedule = schedule.find(day => 
      day.date.toISOString().split('T')[0] === dateStr
    );
    return daySchedule ? daySchedule.seances : [];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* En-tête avec contrôles */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <CalendarToday sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1">
                Emploi du temps
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {viewMode === 'day' 
                  ? formatDateLong(currentDate)
                  : `Semaine du ${formatDateLong(getWeekDates()[0])}`
                }
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center" gap={2}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
            >
              <ToggleButton value="day">
                <ViewDay sx={{ mr: 1 }} />
                Jour
              </ToggleButton>
              <ToggleButton value="week">
                <ViewWeek sx={{ mr: 1 }} />
                Semaine
              </ToggleButton>
            </ToggleButtonGroup>
            
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton onClick={handlePrevious}>
                <ArrowBackIos />
              </IconButton>
              
              <Button
                variant="outlined"
                startIcon={<Today />}
                onClick={handleToday}
              >
                Aujourd'hui
              </Button>
              
              <IconButton onClick={handleNext}>
                <ArrowForwardIos />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Affichage selon le mode */}
        {viewMode === 'day' ? (
          // Vue Jour
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              {formatDateLong(currentDate)}
            </Typography>
            
            {getSeancesForDate(currentDate).length > 0 ? (
              <Grid container spacing={2}>
                {getSeancesForDate(currentDate).map((seance) => {
                  const startTime = formatTime(seance.dateDebut);
                  const endTime = formatTime(seance.dateFin);
                  
                  return (
                    <Grid item xs={12} key={seance.id}>
                      <Card 
                        onClick={() => handleSeanceClick(seance)}
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
                        }}
                      >
                        <CardContent>
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item xs={2}>
                              <Box textAlign="center">
                                <Typography variant="h5" color="primary">
                                  {startTime}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {endTime}
                                </Typography>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={1}>
                              <Divider orientation="vertical" flexItem />
                            </Grid>
                            
                            <Grid item xs={9}>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                  <Typography variant="h6">
                                    {seance.cours.titre}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {seance.cours.code} • {seance.description}
                                  </Typography>
                                  
                                  <Box display="flex" gap={2} mt={1}>
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                      <Person fontSize="small" />
                                      <Typography variant="body2">
                                        {seance.cours.formateur.prenom} {seance.cours.formateur.nom}
                                      </Typography>
                                    </Box>
                                    
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                      <LocationOn fontSize="small" />
                                      <Typography variant="body2">
                                        {seance.salle}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                                
                                <Chip 
                                  label={seance.type}
                                  color={getTypeColor(seance.type)}
                                  size="small"
                                />
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Box textAlign="center" py={6}>
                <Event sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Aucune séance prévue
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vous n'avez pas de cours prévus pour cette journée
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          // Vue Semaine
          <Box>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {getWeekDates().map((date, index) => {
                const isToday = date.toDateString() === new Date().toDateString();
                const seances = getSeancesForDate(date);
                
                return (
                  <Grid item xs key={index}>
                    <Card 
                      variant={isToday ? 'elevation' : 'outlined'}
                      sx={{ 
                        textAlign: 'center',
                        bgcolor: isToday ? 'primary.light' : 'background.paper',
                        borderColor: isToday ? 'primary.main' : 'divider'
                      }}
                    >
                      <CardContent sx={{ p: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                        </Typography>
                        <Typography variant="h6" fontWeight={isToday ? 'bold' : 'normal'}>
                          {date.getDate()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {date.toLocaleDateString('fr-FR', { month: 'short' })}
                        </Typography>
                        
                        {seances.length > 0 && (
                          <Box mt={1}>
                            <Chip 
                              label={`${seances.length} séance${seances.length > 1 ? 's' : ''}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
            
            {/* Grille horaire */}
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
              {/* En-tête des heures */}
              <Box display="flex" borderBottom="1px solid #e0e0e0">
                <Box width={80} sx={{ borderRight: '1px solid #e0e0e0', p: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Heure
                  </Typography>
                </Box>
                {getWeekDates().map((date, index) => (
                  <Box 
                    key={index} 
                    flex={1} 
                    sx={{ 
                      p: 1,
                      borderRight: index < 6 ? '1px solid #e0e0e0' : 'none',
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="caption" fontWeight="medium">
                      {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                    </Typography>
                  </Box>
                ))}
              </Box>
              
              {/* Lignes horaires */}
              {Array.from({ length: 10 }, (_, i) => i + 8).map((hour) => (
                <Box key={hour} display="flex" borderBottom="1px solid #f0f0f0">
                  <Box 
                    width={80} 
                    sx={{ 
                      borderRight: '1px solid #e0e0e0',
                      p: 1,
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="body2">
                      {hour}:00
                    </Typography>
                  </Box>
                  
                  {getWeekDates().map((date, dayIndex) => {
                    const seances = getSeancesForDate(date);
                    const seanceInHour = seances.find(s => {
                      const startHour = new Date(s.dateDebut).getHours();
                      return startHour === hour;
                    });
                    
                    return (
                      <Box 
                        key={dayIndex}
                        flex={1}
                        sx={{ 
                          minHeight: 60,
                          borderRight: dayIndex < 6 ? '1px solid #f0f0f0' : 'none',
                          p: 0.5,
                          bgcolor: seanceInHour ? `${getTypeColor(seanceInHour.type)}.light` : 'transparent'
                        }}
                        onClick={() => seanceInHour && handleSeanceClick(seanceInHour)}
                      >
                        {seanceInHour && (
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              height: '100%',
                              cursor: 'pointer',
                              borderColor: `${getTypeColor(seanceInHour.type)}.main`,
                              '&:hover': { boxShadow: 2 }
                            }}
                          >
                            <CardContent sx={{ p: 1 }}>
                              <Typography variant="caption" fontWeight="bold">
                                {seanceInHour.cours.code}
                              </Typography>
                              <Typography variant="caption" display="block" noWrap>
                                {seanceInHour.salle}
                              </Typography>
                              <Chip 
                                label={seanceInHour.type}
                                size="small"
                                sx={{ 
                                  height: 16,
                                  fontSize: '0.6rem',
                                  mt: 0.5
                                }}
                              />
                            </CardContent>
                          </Card>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Légende */}
        <Box display="flex" gap={2} mt={3} flexWrap="wrap">
          <Typography variant="body2" fontWeight="medium">
            Légende :
          </Typography>
          {['COURS', 'TD', 'TP', 'EXAMEN'].map((type) => (
            <Box key={type} display="flex" alignItems="center" gap={0.5}>
              <Box
                width={12}
                height={12}
                borderRadius="2px"
                bgcolor={`${getTypeColor(type)}.main`}
              />
              <Typography variant="caption">
                {type}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Dialog pour les détails de la séance */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        {selectedSeance && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <School />
                {selectedSeance.cours.titre}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTime />
                    <Typography>
                      {formatTime(selectedSeance.dateDebut)} - {formatTime(selectedSeance.dateFin)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationOn />
                    <Typography>
                      Salle: {selectedSeance.salle}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Person />
                    <Typography>
                      Formateur: {selectedSeance.cours.formateur.prenom} {selectedSeance.cours.formateur.nom}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Info />
                    <Typography>
                      Type: {selectedSeance.type}
                    </Typography>
                  </Box>
                </Grid>
                
                {selectedSeance.description && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      {selectedSeance.description}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Fermer</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default EmploiDuTemps;