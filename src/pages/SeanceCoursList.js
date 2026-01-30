// pages/SeanceCoursList.js
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
  List,
  ListItem,
  Divider,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
} from '@mui/material';
import {
  CalendarToday,
  LocationOn,
  Today,
  Event,
  Person,
  AccessTime,
  School,
} from '@mui/icons-material';
import { seanceCoursApi } from '../services/index';

const SeanceCoursList = () => {
  const [seances, setSeances] = useState([]);
  const [filteredSeances, setFilteredSeances] = useState([]);
  const [viewMode, setViewMode] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSeances();
  }, []);

  useEffect(() => {
    filterSeances();
  }, [viewMode, seances]);

  const fetchSeances = async () => {
    try {
      setLoading(true);
      console.log('Chargement des séances...');
      
      // Utiliser getAll() au lieu de getAVenir()
      const response = await seanceCoursApi.getAll();
      console.log('Données reçues:', response.data);
      
      // Filtrer les séances à venir
      const now = new Date();
      const seancesAVenir = response.data.filter(seance => {
        const seanceDate = new Date(seance.dateDebut);
        return seanceDate >= now;
      });
      
      setSeances(seancesAVenir);
      setError(null);
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError('Erreur lors du chargement des séances');
    } finally {
      setLoading(false);
    }
  };

  const filterSeances = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    let filtered = seances;

    if (viewMode === 'today') {
      filtered = seances.filter(seance => {
        const seanceDate = new Date(seance.dateDebut);
        return seanceDate >= today && seanceDate < tomorrow;
      });
    } else if (viewMode === 'week') {
      filtered = seances.filter(seance => {
        const seanceDate = new Date(seance.dateDebut);
        return seanceDate >= today && seanceDate < weekEnd;
      });
    }
    // 'all' montre toutes les séances à venir

    // Trier par date
    filtered.sort((a, b) => new Date(a.dateDebut) - new Date(b.dateDebut));
    setFilteredSeances(filtered);
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return { date: 'N/A', time: 'N/A', fullDate: 'N/A' };
    
    try {
      const date = new Date(dateTimeString);
      return {
        date: date.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long',
          year: 'numeric'
        }),
        time: date.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        fullDate: date.toLocaleString('fr-FR'),
      };
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return { date: 'Date invalide', time: '', fullDate: dateTimeString };
    }
  };

  const getTypeColor = (type) => {
    if (!type) return 'default';
    switch (type.toUpperCase()) {
      case 'COURS': return 'primary';
      case 'TD': return 'secondary';
      case 'TP': return 'success';
      case 'EXAMEN': return 'error';
      default: return 'default';
    }
  };

  const formatType = (type) => {
    if (!type) return 'Cours';
    const typeMap = {
      'COURS': 'Cours',
      'TD': 'TD',
      'TP': 'TP',
      'EXAMEN': 'Examen'
    };
    return typeMap[type.toUpperCase()] || type;
  };

  const getTimeSlot = (start, end) => {
    const startTime = formatDateTime(start).time;
    const endTime = formatDateTime(end).time;
    return `${startTime} - ${endTime}`;
  };

  const getDuration = (start, end) => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffMs = endDate - startDate;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffHours > 0) {
        return `${diffHours}h ${diffMinutes}min`;
      }
      return `${diffMinutes} min`;
    } catch (error) {
      return 'Durée inconnue';
    }
  };

  const groupByDate = (seancesList) => {
    if (!seancesList || seancesList.length === 0) return {};
    
    return seancesList.reduce((groups, seance) => {
      try {
        const date = new Date(seance.dateDebut).toDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(seance);
      } catch (error) {
        console.error('Erreur lors du groupement par date:', error);
      }
      return groups;
    }, {});
  };

  const groupedSeances = groupByDate(filteredSeances);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Chargement des séances...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Séances de Cours
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {filteredSeances.length} séance{filteredSeances.length !== 1 ? 's' : ''} à venir
            </Typography>
          </Box>
          
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="today">
              <Today sx={{ mr: 1 }} />
              Aujourd'hui
            </ToggleButton>
            <ToggleButton value="week">
              <Event sx={{ mr: 1 }} />
              Cette semaine
            </ToggleButton>
            <ToggleButton value="all">
              <CalendarToday sx={{ mr: 1 }} />
              Toutes
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {filteredSeances.length === 0 ? (
          <Box textAlign="center" py={6}>
            <CalendarToday sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucune séance à venir
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {viewMode === 'today' 
                ? "Aucune séance de cours n'est prévue aujourd'hui" 
                : viewMode === 'week'
                ? "Aucune séance de cours n'est prévue cette semaine"
                : "Aucune séance de cours n'est actuellement planifiée"
              }
            </Typography>
            <Alert severity="info" sx={{ mt: 2, maxWidth: 400, mx: 'auto' }}>
              <Typography variant="body2">
                Vérifiez que des séances de cours sont créées dans le système.
              </Typography>
            </Alert>
          </Box>
        ) : (
          <Box>
            {Object.keys(groupedSeances).map((date) => (
              <Box key={date} sx={{ mb: 4 }}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 0 }}>
                    {/* En-tête de date */}
                    <Box sx={{ 
                      bgcolor: 'primary.light', 
                      color: 'white', 
                      p: 2,
                      borderBottom: 1,
                      borderColor: 'divider'
                    }}>
                      <Typography variant="h6">
                        {formatDateTime(date).date}
                      </Typography>
                    </Box>
                    
                    {/* Liste des séances */}
                    <List>
                      {groupedSeances[date].map((seance, index) => {
                        const timeSlot = getTimeSlot(seance.dateDebut, seance.dateFin);
                        const duration = getDuration(seance.dateDebut, seance.dateFin);
                        
                        return (
                          <React.Fragment key={seance.id}>
                            <ListItem sx={{ py: 2, px: 3 }}>
                              <Box display="flex" width="100%" alignItems="flex-start">
                                {/* Colonne de temps */}
                                <Box sx={{ minWidth: 140, mr: 3 }}>
                                  <Box display="flex" alignItems="center" mb={0.5}>
                                    <AccessTime sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} />
                                    <Typography variant="h6" color="primary.main">
                                      {timeSlot}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Durée: {duration}
                                  </Typography>
                                </Box>
                                
                                <Divider orientation="vertical" flexItem sx={{ mr: 3 }} />
                                
                                {/* Colonne des détails */}
                                <Box sx={{ flex: 1 }}>
                                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                    <Box>
                                      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                                        {seance.description || `Cours #${seance.coursId}`}
                                      </Typography>
                                      
                                      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                          <School fontSize="small" color="action" />
                                          <Typography variant="body2" color="text.secondary">
                                            Cours ID: {seance.coursId}
                                          </Typography>
                                        </Box>
                                        
                                        {seance.salle && (
                                          <Box display="flex" alignItems="center" gap={0.5}>
                                            <LocationOn fontSize="small" color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                              {seance.salle}
                                            </Typography>
                                          </Box>
                                        )}
                                      </Box>
                                    </Box>
                                    
                                    <Box>
                                      <Chip 
                                        label={formatType(seance.type)} 
                                        size="small"
                                        color={getTypeColor(seance.type)}
                                        sx={{ fontWeight: 'medium' }}
                                      />
                                    </Box>
                                  </Box>
                                  
                                  {seance.description && (
                                    <Box sx={{ mt: 1 }}>
                                      <Typography variant="body2" color="text.secondary">
                                        {seance.description}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            </ListItem>
                            
                            {index < groupedSeances[date].length - 1 && (
                              <Divider sx={{ mx: 3 }} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </List>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default SeanceCoursList;