// pages/MesNotes.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Grade,
  TrendingUp,
  BarChart,
  CheckCircle,
  Warning,
  Info,
} from '@mui/icons-material';
import { noteApi, coursApi } from '../services/index'; // Ajoutez coursApi
import authService from '../services/authService';

const MesNotes = () => {
  const [notes, setNotes] = useState([]);
  const [coursData, setCoursData] = useState({}); // Cache pour les données des cours
  const [stats, setStats] = useState({
    moyenneGenerale: 0,
    totalNotes: 0,
    meilleureNote: 0,
    pireNote: 20,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      
      // Récupérer toutes les notes
      const notesResponse = await noteApi.getAll();
      const allNotes = notesResponse.data;
      
      // Filtrer pour l'étudiant connecté (pour l'instant, étudiant ID 10)
      const etudiantId = 10; // À remplacer par l'ID de l'utilisateur connecté
      const notesData = allNotes.filter(note => note.etudiantId === etudiantId);
      
      // Récupérer les données des cours
      const coursIds = [...new Set(notesData.map(note => note.coursId))];
      const coursPromises = coursIds.map(id => coursApi.getById(id));
      const coursResponses = await Promise.all(coursPromises);
      
      // Créer un objet avec les données des cours
      const coursCache = {};
      coursResponses.forEach(response => {
        if (response.data) {
          coursCache[response.data.id] = response.data;
        }
      });
      
      setCoursData(coursCache);
      
      // Enrichir les notes avec les données des cours
      const enrichedNotes = notesData.map(note => ({
        ...note,
        cours: coursCache[note.coursId] || { 
          titre: `Cours ${note.coursId}`, 
          code: `COUR${note.coursId}` 
        },
        typeEvaluation: note.type,
        dateEvaluation: note.dateAttribution,
        appreciation: '', // À remplir si vous avez ce champ
      }));
      
      // Calculer les statistiques
      const totalCoefficient = enrichedNotes.reduce((sum, note) => sum + (note.coefficient || 1), 0);
      const totalPondere = enrichedNotes.reduce((sum, note) => sum + (note.valeur * (note.coefficient || 1)), 0);
      const moyenne = totalCoefficient > 0 ? totalPondere / totalCoefficient : 0;
      
      const notesValues = enrichedNotes.map(n => n.valeur);
      const meilleureNote = notesValues.length > 0 ? Math.max(...notesValues) : 0;
      const pireNote = notesValues.length > 0 ? Math.min(...notesValues) : 20;
      
      setNotes(enrichedNotes);
      setStats({
        moyenneGenerale: parseFloat(moyenne.toFixed(2)),
        totalNotes: enrichedNotes.length,
        meilleureNote: parseFloat(meilleureNote.toFixed(2)),
        pireNote: parseFloat(pireNote.toFixed(2)),
      });
      
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des notes');
      console.error('Erreur détaillée:', err.response || err.message || err);
    } finally {
      setLoading(false);
    }
  };

  const getNoteColor = (note) => {
    if (note >= 16) return 'success';
    if (note >= 12) return 'info';
    if (note >= 10) return 'warning';
    return 'error';
  };

  const getNoteIcon = (note) => {
    if (note >= 16) return <CheckCircle />;
    if (note >= 10) return <Info />;
    return <Warning />;
  };

  const getMention = (moyenne) => {
    if (moyenne >= 16) return 'Très Bien';
    if (moyenne >= 14) return 'Bien';
    if (moyenne >= 12) return 'Assez Bien';
    if (moyenne >= 10) return 'Passable';
    return 'Insuffisant';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const mapTypeNote = (type) => {
    const typeMap = {
      'DEVOIR': 'Devoir',
      'EXAMEN': 'Examen',
      'PROJET': 'Projet',
      'PARTICIPATION': 'Participation'
    };
    return typeMap[type] || type;
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
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Grade sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1">
              Mes Notes
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Consultez vos résultats académiques
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Statistiques */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main" gutterBottom>
                  {stats.moyenneGenerale.toFixed(2)}/20
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Moyenne Générale
                </Typography>
                <Chip 
                  label={getMention(stats.moyenneGenerale)} 
                  size="small" 
                  color={getNoteColor(stats.moyenneGenerale)}
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="secondary.main" gutterBottom>
                  {stats.totalNotes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Notes enregistrées
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" gutterBottom>
                  {stats.meilleureNote}/20
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Meilleure note
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main" gutterBottom>
                  {stats.pireNote}/20
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Note à améliorer
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Graphique de progression */}
        {notes.length > 0 && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TrendingUp sx={{ verticalAlign: 'middle', mr: 1 }} />
                Évolution des notes
              </Typography>
              <Box sx={{ mt: 2 }}>
                {notes.map((note) => (
                  <Box key={note.id} mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">
                        {note.cours.titre}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {note.valeur.toFixed(2)}/20
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(note.valeur / 20) * 100} 
                      color={getNoteColor(note.valeur)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Tableau des notes détaillées */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <BarChart sx={{ verticalAlign: 'middle', mr: 1 }} />
              Détail des notes
            </Typography>
            
            {notes.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="text.secondary">
                  Aucune note enregistrée pour le moment
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
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
                    {notes.map((note) => (
                      <TableRow key={note.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {note.cours.titre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {note.cours.code}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={mapTypeNote(note.typeEvaluation)} 
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getNoteIcon(note.valeur)}
                            <Typography 
                              variant="h6" 
                              color={`${getNoteColor(note.valeur)}.main`}
                              fontWeight="bold"
                            >
                              {note.valeur.toFixed(2)}/20
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`x${note.coefficient || 1}`} 
                            size="small"
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(note.dateEvaluation)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {note.appreciation || 'Aucune appréciation'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Informations complémentaires */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Note :</strong> Ces notes sont fournies à titre indicatif. 
            Les notes officielles sont disponibles auprès du secrétariat pédagogique.
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
};

export default MesNotes;