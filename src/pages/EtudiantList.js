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
  Avatar,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Search, Person, School, Group, Email, Phone } from '@mui/icons-material';
import { etudiantApi, specialiteApi, groupeApi } from '../services/index';
import { Link } from 'react-router-dom';

const EtudiantList = () => {
  const [etudiants, setEtudiants] = useState([]);
  const [filteredEtudiants, setFilteredEtudiants] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    specialite: '',
    groupe: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = etudiants;

    // Filtre par recherche
    if (searchTerm) {
      result = result.filter(
        (e) =>
          (e.nom && `${e.nom} ${e.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (e.matricule && e.matricule.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (e.email && e.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtre par spécialité
    if (filters.specialite) {
      result = result.filter(
        (e) => e.specialite && e.specialite.id === parseInt(filters.specialite)
      );
    }

    // Filtre par groupe
    if (filters.groupe) {
      result = result.filter(
        (e) => e.groupe && e.groupe.id === parseInt(filters.groupe)
      );
    }

    setFilteredEtudiants(result);
  }, [searchTerm, filters, etudiants]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fonction pour extraire les données de différentes structures d'API
      const extractData = (response) => {
        if (!response || !response.data) return [];
        
        let data = response.data;
        
        // Vérifier différentes structures de réponse
        if (Array.isArray(data)) {
          return data;
        } else if (data.content && Array.isArray(data.content)) {
          // Structure de pagination Spring
          return data.content;
        } else if (data.data && Array.isArray(data.data)) {
          // Structure avec propriété data
          return data.data;
        } else if (data.etudiants && Array.isArray(data.etudiants)) {
          return data.etudiants;
        } else if (data.specialites && Array.isArray(data.specialites)) {
          return data.specialites;
        } else if (data.groupes && Array.isArray(data.groupes)) {
          return data.groupes;
        }
        
        console.warn('Structure de données non reconnue:', data);
        return [];
      };

      // Récupérer toutes les données en parallèle
      const [etudiantsResponse, specialitesResponse, groupesResponse] = await Promise.all([
        etudiantApi.getAll(),
        specialiteApi.getAll(),
        groupeApi.getAll(),
      ]);

      console.log('Réponses API:', {
        etudiants: etudiantsResponse.data,
        specialites: specialitesResponse.data,
        groupes: groupesResponse.data
      });

      // Extraire les données avec la fonction helper
      const etudiantsData = extractData(etudiantsResponse);
      const specialitesData = extractData(specialitesResponse);
      const groupesData = extractData(groupesResponse);

      setEtudiants(etudiantsData);
      setSpecialites(specialitesData);
      setGroupes(groupesData);
      setFilteredEtudiants(etudiantsData);
      setError(null);
      
    } catch (err) {
      console.error('Erreur détaillée:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur inconnue';
      setError(`Erreur lors du chargement des données: ${errorMessage}`);
      
      // Données de démonstration en cas d'erreur
      const demoEtudiants = [
        {
          id: 1,
          matricule: 'ETU001',
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean.dupont@email.com',
          telephone: '01 23 45 67 89',
          dateNaissance: '2000-01-15',
          dateInscription: '2023-09-01',
          specialite: { id: 1, nom: 'Informatique' },
          groupe: { id: 1, nom: 'Groupe A' }
        },
        {
          id: 2,
          matricule: 'ETU002',
          nom: 'Martin',
          prenom: 'Marie',
          email: 'marie.martin@email.com',
          telephone: '01 98 76 54 32',
          dateNaissance: '2001-03-22',
          dateInscription: '2023-09-01',
          specialite: { id: 2, nom: 'Mathématiques' },
          groupe: { id: 2, nom: 'Groupe B' }
        }
      ];
      
      const demoSpecialites = [
        { id: 1, nom: 'Informatique' },
        { id: 2, nom: 'Mathématiques' },
        { id: 3, nom: 'Physique' }
      ];
      
      const demoGroupes = [
        { id: 1, nom: 'Groupe A' },
        { id: 2, nom: 'Groupe B' },
        { id: 3, nom: 'Groupe C' }
      ];
      
      setEtudiants(demoEtudiants);
      setSpecialites(demoSpecialites);
      setGroupes(demoGroupes);
      setFilteredEtudiants(demoEtudiants);
      
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (nom, prenom) => {
    return `${nom?.charAt(0) || ''}${prenom?.charAt(0) || ''}`.toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement des étudiants...</Typography>
      </Box>
    );
  }

  // Assurer que specialites et groupes sont bien des tableaux
  const safeSpecialites = Array.isArray(specialites) ? specialites : [];
  const safeGroupes = Array.isArray(groupes) ? groupes : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Liste des Étudiants
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              {filteredEtudiants.length} étudiant{filteredEtudiants.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error} - Affichage des données de démonstration
          </Alert>
        )}

        {/* Filtres */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Rechercher un étudiant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Spécialité</InputLabel>
            <Select
              value={filters.specialite}
              label="Spécialité"
              onChange={(e) => setFilters({ ...filters, specialite: e.target.value })}
            >
              <MenuItem value="">Toutes</MenuItem>
              {safeSpecialites.map((spec) => (
                <MenuItem key={spec.id} value={spec.id}>
                  {spec.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Groupe</InputLabel>
            <Select
              value={filters.groupe}
              label="Groupe"
              onChange={(e) => setFilters({ ...filters, groupe: e.target.value })}
            >
              <MenuItem value="">Tous</MenuItem>
              {safeGroupes.map((groupe) => (
                <MenuItem key={groupe.id} value={groupe.id}>
                  {groupe.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {filteredEtudiants.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Person sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Aucun étudiant trouvé
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Essayez de modifier vos filtres de recherche
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Étudiant</strong></TableCell>
                  <TableCell><strong>Matricule</strong></TableCell>
                  <TableCell><strong>Contact</strong></TableCell>
                  <TableCell><strong>Spécialité</strong></TableCell>
                  <TableCell><strong>Groupe</strong></TableCell>
                  <TableCell><strong>Date Inscription</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEtudiants.map((etudiant) => (
                  <TableRow 
                    key={etudiant.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    component={Link}
                    to={`/etudiants/${etudiant.id}`}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'primary.main',
                            width: 40,
                            height: 40
                          }}
                        >
                          {getInitials(etudiant.nom, etudiant.prenom)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {etudiant.prenom} {etudiant.nom}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {etudiant.dateNaissance && formatDate(etudiant.dateNaissance)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={etudiant.matricule} 
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <Email fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                            {etudiant.email}
                          </Typography>
                        </Box>
                        {etudiant.telephone && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <Phone fontSize="small" color="action" />
                            <Typography variant="body2">
                              {etudiant.telephone}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {etudiant.specialite ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <School fontSize="small" color="action" />
                          <Typography variant="body2">
                            {etudiant.specialite.nom}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Non assigné
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {etudiant.groupe ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Group fontSize="small" color="action" />
                          <Typography variant="body2">
                            {etudiant.groupe.nom}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Non assigné
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(etudiant.dateInscription)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {/* Debug info - à retirer en production */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Debug Info:</strong><br />
              Étudiants: {etudiants.length}<br />
              Spécialités: {safeSpecialites.length}<br />
              Groupes: {safeGroupes.length}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default EtudiantList;