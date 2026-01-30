// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Composants
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import FormateurDashboard from './pages/FormateurDashboard';
import EtudiantDashboard from './pages/EtudiantDashboard';

// Pages de consultation (partagées)
import CoursList from './pages/CoursList';
import CoursDetail from './pages/CoursDetail';
import EtudiantList from './pages/EtudiantList';
import EtudiantDetail from './pages/EtudiantDetail';
import SeanceCoursList from './pages/SeanceCoursList';
import SpecialiteList from './pages/SpecialiteList';
import GroupeList from './pages/GroupeList';
import MesNotes from './pages/MesNotes';
import EmploiDuTemps from './pages/EmploiDuTemps';

// Création du thème
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          
          {/* Routes protégées - Étudiant */}
          <Route
            path="/etudiant/*"
            element={
              <PrivateRoute roles={['ETUDIANT', 'ADMIN']}>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<EtudiantDashboard />} />
                    <Route path="/cours" element={<CoursList />} />
                    <Route path="/cours/:id" element={<CoursDetail />} />
                    <Route path="/etudiants" element={<EtudiantList />} />
                    <Route path="/etudiants/:id" element={<EtudiantDetail />} />
                    <Route path="/seances" element={<SeanceCoursList />} />
                    <Route path="/specialites" element={<SpecialiteList />} />
                    <Route path="/groupes" element={<GroupeList />} />
                    <Route path="/mes-notes" element={<MesNotes />} />
                    <Route path="/emploi-du-temps" element={<EmploiDuTemps />} />
                    <Route path="*" element={<Navigate to="/etudiant/dashboard" />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
          
          {/* Routes protégées - Formateur */}
          <Route
            path="/formateur/*"
            element={
              <PrivateRoute roles={['FORMATEUR', 'ADMIN']}>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<FormateurDashboard />} />
                    <Route path="/cours" element={<CoursList />} />
                    <Route path="/cours/:id" element={<CoursDetail />} />
                    <Route path="/etudiants" element={<EtudiantList />} />
                    <Route path="/etudiants/:id" element={<EtudiantDetail />} />
                    <Route path="/seances" element={<SeanceCoursList />} />
                    <Route path="/specialites" element={<SpecialiteList />} />
                    <Route path="/groupes" element={<GroupeList />} />
                    <Route path="*" element={<Navigate to="/formateur/dashboard" />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
          
          {/* Redirection basée sur le rôle après login */}
          <Route path="/auth/callback" element={
            <PrivateRoute>
              <NavigateToDashboard />
            </PrivateRoute>
          } />
          
          {/* Route par défaut */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

// Composant pour rediriger vers le bon dashboard
function NavigateToDashboard() {
  React.useEffect(() => {
    // Vérifier le rôle et rediriger
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === 'ETUDIANT') {
        window.location.href = '/etudiant/dashboard';
      } else if (user.role === 'FORMATEUR') {
        window.location.href = '/formateur/dashboard';
      } else {
        window.location.href = '/login';
      }
    } else {
      window.location.href = '/login';
    }
  }, []);
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      Redirection en cours...
    </div>
  );
}

export default App;