import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search, CalendarToday, Person, School, Refresh } from '@mui/icons-material';
import axios from 'axios';
import { Link } from 'react-router-dom';

const CoursList = () => {
  const [cours, setCours] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuration de l'API
  const API_URL = 'http://localhost:8080/api/cours';

  useEffect(() => {
    fetchCours();
  }, []);

  const fetchCours = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Tentative de connexion à:', API_URL);
      
      // Méthode simple avec axios
      const response = await axios.get(API_URL);
      
      console.log('Réponse reçue:', response);
      console.log('Données brutes:', response.data);
      
      // Vérification des données
      if (!response.data) {
        throw new Error('Aucune donnée reçue du serveur');
      }
      
      let coursData = response.data;
      
      // Si ce n'est pas un tableau, on tente de le convertir
      if (!Array.isArray(coursData)) {
        console.log('Les données ne sont pas un tableau, tentative de conversion...');
        
        // Essayons différentes structures possibles
        if (coursData.content && Array.isArray(coursData.content)) {
          coursData = coursData.content; // Pagination Spring
        } else if (coursData.courses && Array.isArray(coursData.courses)) {
          coursData = coursData.courses;
        } else if (coursData.data && Array.isArray(coursData.data)) {
          coursData = coursData.data;
        } else {
          // Si c'est un objet simple, on le met dans un tableau
          coursData = [coursData];
        }
      }
      
      // Vérification finale
      if (!Array.isArray(coursData)) {
        throw new Error('Format de données invalide');
      }
      
      console.log(`Données finales (${coursData.length} cours):`, coursData);
      
      // Transformation simple des données
      const formattedCours = coursData.map((item, index) => ({
        id: item.id || index + 1,
        code: item.code || `CODE${index + 1}`,
        titre: item.titre || item.title || 'Titre non défini',
        description: item.description || '',
        credit: item.credit || item.credits || 0,
        volumeHoraire: item.volumeHoraire || item.heures || 0,
        
        // Formateur - gérer différentes structures
        formateur: item.formateur 
          ? typeof item.formateur === 'object'
            ? item.formateur
            : { nom: item.formateur }
          : null,
        
        // Spécialité - gérer différentes structures
        specialite: item.specialite
          ? typeof item.specialite === 'object'
            ? item.specialite
            : { nom: item.specialite }
          : null,
          
        // Dates
        dateDebut: item.dateDebut || item.startDate,
        dateFin: item.dateFin || item.endDate
      }));
      
      setCours(formattedCours);
      
    } catch (err) {
      console.error('Erreur complète:', err);
      console.error('Erreur response:', err.response);
      
      setError(`Erreur: ${err.message || 'Impossible de charger les données'}`);
      
      // Données de démonstration
      const demoData = [
        {
          id: 1,
          code: 'MAT101',
          titre: 'Mathématiques Fondamentales',
          description: 'Introduction aux mathématiques pour débutants',
          credit: 3,
          volumeHoraire: 45,
          formateur: { nom: 'Dupont', prenom: 'Jean' },
          specialite: { nom: 'Mathématiques' },
          dateDebut: '2024-01-15',
          dateFin: '2024-05-30'
        },
        {
          id: 2,
          code: 'INF101',
          titre: 'Programmation Java',
          description: 'Apprendre les bases de la programmation orientée objet avec Java',
          credit: 4,
          volumeHoraire: 60,
          formateur: { nom: 'Martin', prenom: 'Sophie' },
          specialite: { nom: 'Informatique' },
          dateDebut: '2024-02-01',
          dateFin: '2024-06-15'
        },
        {
          id: 3,
          code: 'PHY101',
          titre: 'Physique Générale',
          description: 'Cours de physique pour les sciences de l\'ingénieur',
          credit: 3,
          volumeHoraire: 50,
          formateur: { nom: 'Leroy', prenom: 'Pierre' },
          specialite: { nom: 'Physique' },
          dateDebut: '2024-01-20',
          dateFin: '2024-06-10'
        }
      ];
      
      setCours(demoData);
      
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les cours en fonction de la recherche
  const filteredCours = cours.filter(c => 
    c.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRefresh = () => {
    fetchCours();
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  // Fonction pour obtenir le nom du formateur
  const getFormateurName = (formateur) => {
    if (!formateur) return 'Non assigné';
    
    if (typeof formateur === 'object') {
      if (formateur.prenom && formateur.nom) {
        return `${formateur.prenom} ${formateur.nom}`;
      } else if (formateur.nom) {
        return formateur.nom;
      } else if (formateur.name) {
        return formateur.name;
      }
      return 'Formateur inconnu';
    }
    
    return String(formateur);
  };

  // Fonction pour obtenir le nom de la spécialité
  const getSpecialiteName = (specialite) => {
    if (!specialite) return 'Non assignée';
    
    if (typeof specialite === 'object') {
      return specialite.nom || specialite.name || specialite.libelle || 'Spécialité';
    }
    
    return String(specialite);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement des cours...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Liste des Cours
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Rechercher un cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ minWidth: 300 }}
            />
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
            >
              Actualiser
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error} - Affichage des données de démonstration
          </Alert>
        )}

        {/* Informations de débogage */}
        {process.env.NODE_ENV === 'development' && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Info:</strong> {filteredCours.length} cours affichés sur {cours.length} disponibles
            </Typography>
          </Alert>
        )}

        {filteredCours.length === 0 ? (
          <Box textAlign="center" py={4}>
            <School sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Aucun cours trouvé
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Essayez de modifier votre recherche ou de rafraîchir les données
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              sx={{ mt: 2 }}
            >
              Rafraîchir
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Code</strong></TableCell>
                  <TableCell><strong>Titre</strong></TableCell>
                  <TableCell><strong>Crédits</strong></TableCell>
                  <TableCell><strong>Heures</strong></TableCell>
                  <TableCell><strong>Période</strong></TableCell>
                  <TableCell><strong>Formateur</strong></TableCell>
                  <TableCell><strong>Spécialité</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCours.map((coursItem) => (
                  <TableRow 
                    key={coursItem.id}
                    hover
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                    onClick={() => console.log('Cours cliqué:', coursItem)}
                  >
                    <TableCell>
                      <Chip 
                        label={coursItem.code} 
                        color="primary" 
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {coursItem.titre}
                      </Typography>
                      {coursItem.description && (
                        <Typography variant="body2" color="text.secondary">
                          {coursItem.description.substring(0, 60)}...
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${coursItem.credit} crédits`} 
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {coursItem.volumeHoraire} h
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatDate(coursItem.dateDebut)} - {formatDate(coursItem.dateFin)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2">
                          {getFormateurName(coursItem.formateur)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <School fontSize="small" color="action" />
                        <Typography variant="body2">
                          {getSpecialiteName(coursItem.specialite)}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Lien pour tester l'API */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            API endpoint: <code>{API_URL}</code>
          </Typography>
          <Button 
            variant="text" 
            size="small" 
            onClick={() => window.open(API_URL, '_blank')}
            sx={{ mt: 1 }}
          >
            Tester l'API dans un nouvel onglet
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CoursList;