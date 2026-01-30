import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  School,
  Person,
  Groups,
  Class,
  CalendarToday,
  Dashboard,
  Logout,
  Grade,
  Notifications,
  Settings,
  Book,
  Schedule,
  AdminPanelSettings,
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

// Configuration des liens par rôle
const menuConfig = {
  ETUDIANT: [
    { name: 'Tableau de bord', path: '/dashboard', icon: <Dashboard /> },
    { name: 'Mes Cours', path: '/mes-cours', icon: <Class /> },
    { name: 'Tous les Cours', path: '/cours', icon: <Book /> },
    { name: 'Mes Notes', path: '/mes-notes', icon: <Grade /> },
    { name: 'Emploi du temps', path: '/emploi-du-temps', icon: <Schedule /> },
    { name: 'Séances', path: '/seances', icon: <CalendarToday /> },
  ],
  FORMATEUR: [
    { name: 'Tableau de bord', path: '/dashboard', icon: <Dashboard /> },
    { name: 'Mes Cours', path: '/mes-cours', icon: <Class /> },
    { name: 'Tous les Cours', path: '/cours', icon: <Book /> },
    { name: 'Étudiants', path: '/etudiants', icon: <Person /> },
    { name: 'Séances', path: '/seances', icon: <CalendarToday /> },
    { name: 'Gestion des notes', path: '/gestion-notes', icon: <Grade /> },
    { name: 'Groupes', path: '/groupes', icon: <Groups /> },
    { name: 'Spécialités', path: '/specialites', icon: <School /> },
  ],
  ADMIN: [
    { name: 'Tableau de bord', path: '/dashboard', icon: <Dashboard /> },
    { name: 'Administration', path: '/admin', icon: <AdminPanelSettings /> },
    { name: 'Tous les Cours', path: '/cours', icon: <Book /> },
    { name: 'Étudiants', path: '/etudiants', icon: <Person /> },
    { name: 'Formateurs', path: '/formateurs', icon: <Person /> },
    { name: 'Séances', path: '/seances', icon: <CalendarToday /> },
    { name: 'Groupes', path: '/groupes', icon: <Groups /> },
    { name: 'Spécialités', path: '/specialites', icon: <School /> },
  ],
};

const Layout = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications] = useState(3);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      loadUserData(currentUser);
    }
  }, [location.pathname]);

  const loadUserData = async (currentUser) => {
    try {
      // Ici, vous devriez faire un appel API pour récupérer les données utilisateur
      // Pour l'instant, nous utilisons les données stockées dans le localStorage
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      } else {
        // Données par défaut basées sur le rôle
        const defaultData = {
          nom: currentUser.nom || 'Utilisateur',
          prenom: currentUser.prenom || '',
          email: currentUser.email || '',
          ...(currentUser.role === 'ETUDIANT' && { matricule: currentUser.matricule || 'ETU001' }),
          ...(currentUser.role === 'FORMATEUR' && { specialite: currentUser.specialite || 'Informatique' }),
        };
        setUserData(defaultData);
      }
    } catch (error) {
      console.error('Erreur chargement données utilisateur:', error);
    }
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getBasePath = () => {
    if (!user) return '';
    switch (user.role) {
      case 'ETUDIANT': return '/etudiant';
      case 'FORMATEUR': return '/formateur';
      case 'ADMIN': return '/admin';
      default: return '';
    }
  };

  const getLinks = () => {
    if (!user) return [];
    const basePath = getBasePath();
    const menuItems = menuConfig[user.role] || menuConfig.ETUDIANT;
    
    // Ajouter le préfixe de rôle aux chemins
    return menuItems.map(item => ({
      ...item,
      path: `${basePath}${item.path}`
    }));
  };

  const getRoleDisplay = () => {
    if (!user) return '';
    const roles = {
      'ETUDIANT': 'Étudiant',
      'FORMATEUR': 'Formateur',
      'ADMIN': 'Administrateur'
    };
    return roles[user.role] || user.role;
  };

  const getUserDisplayInfo = () => {
    if (!userData) return { name: 'Utilisateur', detail: '' };
    
    const name = `${userData.prenom} ${userData.nom}`;
    let detail = '';
    
    if (user.role === 'ETUDIANT') {
      detail = `Matricule: ${userData.matricule || 'N/A'}`;
    } else if (user.role === 'FORMATEUR') {
      detail = `Spécialité: ${userData.specialite || 'N/A'}`;
    } else if (user.role === 'ADMIN') {
      detail = `Administrateur système`;
    }
    
    return { name, detail };
  };

  const getUserInitials = () => {
    if (!userData) return '?';
    return `${userData.nom?.charAt(0) || ''}${userData.prenom?.charAt(0) || ''}`.toUpperCase();
  };

  const links = getLinks();
  const basePath = getBasePath();
  const { name: displayName, detail: userDetail } = getUserDisplayInfo();

  if (!user) {
    return children; // Pas de layout si non connecté
  }

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', height: '100%' }}>
      {/* Header du drawer */}
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <School sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h6">
          {displayName}
        </Typography>
        <Typography variant="caption" display="block">
          {getRoleDisplay()}
        </Typography>
        {userDetail && (
          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
            {userDetail}
          </Typography>
        )}
      </Box>
      
      <Divider />
      
      {/* Menu items */}
      <List sx={{ flexGrow: 1 }}>
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <ListItem 
              key={link.name} 
              component={Link} 
              to={link.path}
              sx={{ 
                textDecoration: 'none', 
                color: 'inherit',
                backgroundColor: isActive ? 'action.selected' : 'inherit',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'inherit' }}>
                {link.icon}
              </ListItemIcon>
              <ListItemText 
                primary={link.name} 
                primaryTypographyProps={{
                  fontWeight: isActive ? 'bold' : 'normal'
                }}
              />
            </ListItem>
          );
        })}
      </List>
      
      {/* Section utilisateur en bas */}
      <Divider />
      <List>
        <ListItem 
          component={Link} 
          to={`${basePath}/profile`}
          sx={{ 
            textDecoration: 'none', 
            color: 'inherit',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText primary="Profil" />
        </ListItem>
        
        <ListItem 
          component={Link} 
          to={`${basePath}/settings`}
          sx={{ 
            textDecoration: 'none', 
            color: 'inherit',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Paramètres" />
        </ListItem>
        
        <ListItem 
          onClick={handleLogout}
          sx={{ 
            cursor: 'pointer',
            color: 'error.main',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <ListItemIcon sx={{ color: 'error.main' }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Déconnexion" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navbar */}
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Menu mobile */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="menu"
                onClick={handleDrawerToggle}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Box>

            {/* Logo */}
            <Box 
              component={Link} 
              to={`${basePath}/dashboard`}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                textDecoration: 'none', 
                color: 'inherit',
                mr: 2 
              }}
            >
              <School sx={{ mr: 1 }} />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '.2rem',
                }}
              >
                ECOLE
              </Typography>
            </Box>

            {/* Menu desktop */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {links.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Button
                    key={link.name}
                    component={Link}
                    to={link.path}
                    startIcon={link.icon}
                    sx={{ 
                      my: 2, 
                      color: 'white', 
                      display: 'block',
                      mx: 0.5,
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'inherit',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.2)'
                      }
                    }}
                  >
                    {link.name}
                  </Button>
                );
              })}
            </Box>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton color="inherit" sx={{ mr: 2 }}>
                <Badge badgeContent={notifications} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User menu */}
            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ mr: 2, textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {displayName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {getRoleDisplay()}
                </Typography>
              </Box>
              
              <Tooltip title="Menu utilisateur">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar 
                    alt={displayName} 
                    sx={{ 
                      bgcolor: user.role === 'ETUDIANT' ? 'primary.main' : 
                              user.role === 'FORMATEUR' ? 'secondary.main' : 
                              'warning.main',
                      width: 40,
                      height: 40
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem disabled>
                  <ListItemIcon>
                    {user.role === 'ETUDIANT' ? <Person /> : 
                     user.role === 'FORMATEUR' ? <School /> : 
                     <AdminPanelSettings />}
                  </ListItemIcon>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {displayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getRoleDisplay()}
                    </Typography>
                  </Box>
                </MenuItem>
                <Divider />
                
                <MenuItem component={Link} to={`${basePath}/profile`}>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <Typography>Profil</Typography>
                </MenuItem>
                
                <MenuItem component={Link} to={`${basePath}/settings`}>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  <Typography>Paramètres</Typography>
                </MenuItem>
                
                <Divider />
                
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <Typography>Déconnexion</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Drawer mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Contenu principal */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
        {children}
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 3,
          mt: 'auto',
          backgroundColor: (theme) => theme.palette.grey[100],
          borderTop: '1px solid',
          borderColor: (theme) => theme.palette.grey[300],
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            Système de Gestion Scolaire • © {new Date().getFullYear()} • 
            Connecté en tant que: {getRoleDisplay()}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;