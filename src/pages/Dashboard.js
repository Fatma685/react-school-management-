// pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  School,
  Person,
  Groups,
  Class,
  CalendarToday,
  TrendingUp,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { 
  coursApi, 
  etudiantApi, 
  groupeApi, 
  specialiteApi,
  seanceCoursApi 
} from '../services/index';

const Dashboard = () => {
  const [stats, setStats] = useState({
    cours: 0,
    etudiants: 0,
    groupes: 0,
    specialites: 0,
    seancesAujourdhui: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      const [
        coursResponse,
        etudiantsResponse,
        groupesResponse,
        specialitesResponse,
        seancesResponse,
      ] = await Promise.all([
        coursApi.getAll(),
        etudiantApi.getAll(),
        groupeApi.getAll(),
        specialiteApi.getAll(),
        seanceCoursApi.getAVenir(),
      ]);

      // Filtrer les séances d'aujourd'hui
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const seancesAujourdhui = seancesResponse.data.filter(seance => {
        const seanceDate = new Date(seance.dateDebut);
        return seanceDate >= today && seanceDate < tomorrow;
      });

      setStats({
        cours: coursResponse.data.length,
        etudiants: etudiantsResponse.data.length,
        groupes: groupesResponse.data.length,
        specialites: specialitesResponse.data.length,
        seancesAujourdhui: seancesAujourdhui.length,
      });

      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, link }) => (
    <Card 
      component={link ? Link : 'div'}
      to={link}
      sx={{ 
        textDecoration: 'none',
        height: '100%',
        transition: 'transform 0.2s',
        '&:hover': link ? { transform: 'translateY(-4px)', boxShadow: 3 } : {},
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                value
              )}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: '50%',
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon, { 
              sx: { fontSize: 32, color: `${color}.main` } 
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tableau de bord
      </Typography>
      
      <Grid container spacing={3}>
        {/* Statistiques */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Cours"
            value={stats.cours}
            icon={<Class />}
            color="primary"
            link="/cours"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Étudiants"
            value={stats.etudiants}
            icon={<Person />}
            color="secondary"
            link="/etudiants"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Groupes"
            value={stats.groupes}
            icon={<Groups />}
            color="success"
            link="/groupes"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Spécialités"
            value={stats.specialites}
            icon={<School />}
            color="info"
            link="/specialites"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Séances aujourd'hui"
            value={stats.seancesAujourdhui}
            icon={<CalendarToday />}
            color="warning"
            link="/seances"
          />
        </Grid>

        {/* Section Cours récents */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Cours récemment ajoutés
            </Typography>
            <Box sx={{ mt: 2 }}>
              {loading ? (
                <LinearProgress />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Derniers cours: {stats.cours} cours disponibles
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Section Étudiants récents */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Nouveaux étudiants
            </Typography>
            <Box sx={{ mt: 2 }}>
              {loading ? (
                <LinearProgress />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {stats.etudiants} étudiants inscrits au total
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;