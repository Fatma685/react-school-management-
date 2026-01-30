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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { ExpandMore, School, Person, Class, Refresh } from '@mui/icons-material';
import { specialiteApi } from '../services/index';

const SpecialiteList = () => {
  const [specialites, setSpecialites] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSpecialites();
  }, []);

  const fetchSpecialites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await specialiteApi.getAll();
      console.log('Réponse API spécialités:', response.data);
      
      // Fonction pour extraire les données
      const extractData = (data) => {
        if (!data) return [];
        
        if (Array.isArray(data)) {
          return data;
        } else if (data.content && Array.isArray(data.content)) {
          // Structure de pagination Spring
          return data.content;
        } else if (data.data && Array.isArray(data.data)) {
          // Structure avec propriété data
          return data.data;
        } else if (data.specialites && Array.isArray(data.specialites)) {
          return data.specialites;
        }
        
        console.warn('Structure de données non reconnue pour spécialités:', data);
        return [];
      };

      const specialitesData = extractData(response.data);
      
      if (!Array.isArray(specialitesData)) {
        throw new Error('Format de données invalide pour les spécialités');
      }
      
      // S'assurer que chaque spécialité a les propriétés nécessaires
      const formattedSpecialites = specialitesData.map(spec => ({
        id: spec.id || Math.random(),
        code: spec.code || spec.codeSpec || `SPEC${spec.id || ''}`,
        nom: spec.nom || spec.libelle || spec.name || 'Spécialité sans nom',
        description: spec.description || spec.desc || '',
        // S'assurer que cours et etudiants sont des tableaux
        cours: Array.isArray(spec.cours) ? spec.cours : 
               spec.courses ? (Array.isArray(spec.courses) ? spec.courses : []) : [],
        etudiants: Array.isArray(spec.etudiants) ? spec.etudiants : 
                   spec.students ? (Array.isArray(spec.students) ? spec.students : []) : [],
      }));
      
      setSpecialites(formattedSpecialites);
      
    } catch (err) {
      console.error('Erreur détaillée:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur inconnue';
      setError(`Erreur lors du chargement des spécialités: ${errorMessage}`);
      
      // Données de démonstration
      const demoSpecialites = [
        {
          id: 1,
          code: 'INF',
          nom: 'Informatique',
          description: 'Spécialité en développement logiciel et systèmes informatiques',
          cours: [
            { id: 1, titre: 'Programmation Java', credit: 4 },
            { id: 2, titre: 'Base de données', credit: 3 },
            { id: 3, titre: 'Réseaux', credit: 3 },
          ],
          etudiants: [
            { id: 1, nom: 'Dupont', prenom: 'Jean', matricule: 'ETU001' },
            { id: 2, nom: 'Martin', prenom: 'Marie', matricule: 'ETU002' },
          ]
        },
        {
          id: 2,
          code: 'MAT',
          nom: 'Mathématiques',
          description: 'Spécialité en mathématiques appliquées',
          cours: [
            { id: 4, titre: 'Algèbre linéaire', credit: 4 },
            { id: 5, titre: 'Analyse', credit: 4 },
          ],
          etudiants: [
            { id: 3, nom: 'Dubois', prenom: 'Pierre', matricule: 'ETU003' },
          ]
        },
        {
          id: 3,
          code: 'PHY',
          nom: 'Physique',
          description: 'Spécialité en physique fondamentale',
          cours: [
            { id: 6, titre: 'Mécanique', credit: 3 },
            { id: 7, titre: 'Électromagnétisme', credit: 4 },
          ],
          etudiants: []
        }
      ];
      
      setSpecialites(demoSpecialites);
    } finally {
      setLoading(false);
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleRefresh = () => {
    fetchSpecialites();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement des spécialités...</Typography>
      </Box>
    );
  }

  // S'assurer que specialites est un tableau
  const displaySpecialites = Array.isArray(specialites) ? specialites : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Spécialités
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {displaySpecialites.length} spécialité{displaySpecialites.length !== 1 ? 's' : ''} disponible{displaySpecialites.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
          >
            Actualiser
          </Button>
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error} - Affichage des données de démonstration
          </Alert>
        )}

        {displaySpecialites.length === 0 ? (
          <Box textAlign="center" py={4}>
            <School sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Aucune spécialité disponible
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Les spécialités n'ont pas encore été créées ou ne sont pas accessibles
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              sx={{ mt: 2 }}
            >
              Réessayer
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {displaySpecialites.map((specialite) => (
              <Grid item xs={12} key={specialite.id}>
                <Accordion
                  expanded={expanded === `panel-${specialite.id}`}
                  onChange={handleAccordionChange(`panel-${specialite.id}`)}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box display="flex" alignItems="center" gap={2} width="100%">
                      <Box
                        sx={{
                          backgroundColor: 'primary.light',
                          borderRadius: '50%',
                          width: 40,
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <School sx={{ color: 'primary.main' }} />
                      </Box>
                      
                      <Box flex={1}>
                        <Box display="flex" alignItems="center" gap={2} mb={0.5}>
                          <Typography variant="h6">
                            {specialite.nom}
                          </Typography>
                          <Chip 
                            label={specialite.code} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </Box>
                        {specialite.description && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {specialite.description}
                          </Typography>
                        )}
                      </Box>
                      
                      <Box display="flex" gap={3} sx={{ flexShrink: 0 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Class fontSize="small" color="action" />
                          <Typography variant="body2">
                            {Array.isArray(specialite.cours) ? specialite.cours.length : 0} cours
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Person fontSize="small" color="action" />
                          <Typography variant="body2">
                            {Array.isArray(specialite.etudiants) ? specialite.etudiants.length : 0} étudiants
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                              Cours de la spécialité
                            </Typography>
                            {Array.isArray(specialite.cours) && specialite.cours.length > 0 ? (
                              <Box>
                                {specialite.cours.slice(0, 5).map((cours, index) => (
                                  <Box 
                                    key={cours.id || index}
                                    display="flex" 
                                    justifyContent="space-between" 
                                    alignItems="center"
                                    py={1}
                                    borderBottom="1px solid #eee"
                                  >
                                    <Typography variant="body2">
                                      {cours.titre || cours.title || `Cours ${index + 1}`}
                                    </Typography>
                                    <Chip 
                                      label={`${cours.credit || 0} crédits`} 
                                      size="small"
                                      variant="outlined"
                                    />
                                  </Box>
                                ))}
                                {specialite.cours.length > 5 && (
                                  <Typography variant="body2" color="text.secondary" mt={1}>
                                    ... et {specialite.cours.length - 5} autres cours
                                  </Typography>
                                )}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Aucun cours associé à cette spécialité
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                              Étudiants de la spécialité
                            </Typography>
                            {Array.isArray(specialite.etudiants) && specialite.etudiants.length > 0 ? (
                              <Box>
                                {specialite.etudiants.slice(0, 5).map((etudiant, index) => (
                                  <Box 
                                    key={etudiant.id || index}
                                    display="flex" 
                                    alignItems="center"
                                    justifyContent="space-between"
                                    py={1}
                                    borderBottom="1px solid #eee"
                                  >
                                    <Box>
                                      <Typography variant="body2">
                                        {etudiant.prenom || ''} {etudiant.nom || ''}
                                      </Typography>
                                    </Box>
                                    {etudiant.matricule && (
                                      <Chip 
                                        label={etudiant.matricule} 
                                        size="small"
                                        variant="outlined"
                                      />
                                    )}
                                  </Box>
                                ))}
                                {specialite.etudiants.length > 5 && (
                                  <Typography variant="body2" color="text.secondary" mt={1}>
                                    ... et {specialite.etudiants.length - 5} autres étudiants
                                  </Typography>
                                )}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Aucun étudiant dans cette spécialité
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                    
                    {specialite.description && specialite.description.length > 100 && (
                      <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Description complète :
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {specialite.description}
                        </Typography>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Debug info - à retirer en production */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Debug Info:</strong><br />
              Spécialités chargées: {displaySpecialites.length}<br />
              Structure de la première spécialité: {JSON.stringify(displaySpecialites[0] || {}, null, 2)}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default SpecialiteList;