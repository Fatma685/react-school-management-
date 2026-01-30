// components/Navbar.js
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
  Settings,
  Logout,
  Grade,
  Schedule,
  Book,
  AdminPanelSettings,
  Notifications,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

// Menus par rôle
const menuConfig = {
  ETUDIANT: [
    { name: 'Tableau de bord', path: '/dashboard', icon: <Dashboard /> },
    { name: 'Mes Cours', path: '/cours', icon: <Class /> },
    { name: 'Mes Notes', path: '/mes-notes', icon: <Grade /> },
    { name: 'Emploi du temps', path: '/emploi-du-temps', icon: <Schedule /> },
    { name: 'Séances', path: '/seances', icon: <CalendarToday /> },
    { name: 'Cours disponibles', path: '/tous-les-cours', icon: <Book /> },
  ],
  FORMATEUR: [
    { name: 'Tableau de bord', path: '/dashboard', icon: <Dashboard /> },
    { name: 'Mes Cours', path: '/cours', icon: <Class /> },
    { name: 'Étudiants', path: '/etudiants', icon: <Person /> },
    { name: 'Groupes', path: '/groupes', icon: <Groups /> },
    { name: 'Séances', path: '/seances', icon: <CalendarToday /> },
    { name: 'Notes', path: '/notes', icon: <Grade /> },
  ],
  ADMIN: [
    { name: 'Tableau de bord', path: '/dashboard', icon: <Dashboard /> },
    { name: 'Cours', path: '/cours', icon: <Class /> },
    { name: 'Étudiants', path: '/etudiants', icon: <Person /> },
    { name: 'Formateurs', path: '/formateurs', icon: <School /> },
    { name: 'Groupes', path: '/groupes', icon: <Groups /> },
    { name: 'Spécialités', path: '/specialites', icon: <Book /> },
    { name: 'Sessions', path: '/sessions', icon: <CalendarToday /> },
  ],
};

const Navbar = () => {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [pages, setPages] = useState([]);
  const [basePath, setBasePath] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadUser();
  }, [location.pathname]); // Recharge quand l'URL change

  const loadUser = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    if (currentUser) {
      const role = currentUser.role || 'ETUDIANT';
      
      // Déterminer le chemin de base selon le rôle
      let pathPrefix = '';
      switch(role) {
        case 'ETUDIANT':
          pathPrefix = '/etudiant';
          break;
        case 'FORMATEUR':
          pathPrefix = '/formateur';
          break;
        case 'ADMIN':
          pathPrefix = '/admin';
          break;
        default:
          pathPrefix = '/etudiant';
      }
      
      setBasePath(pathPrefix);
      
      // Préfixer tous les chemins du menu
      const menuItems = menuConfig[role] || menuConfig.ETUDIANT;
      const prefixedMenu = menuItems.map(item => ({
        ...item,
        path: `${pathPrefix}${item.path}`
      }));
      
      setPages(prefixedMenu);
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

  const getUserDisplayName = () => {
    if (!user) return 'Utilisateur';
    return `${user.prenom} ${user.nom}`;
  };

  const getUserRoleDisplay = () => {
    if (!user) return '';
    const roles = {
      'ETUDIANT': 'Étudiant',
      'FORMATEUR': 'Formateur',
      'ADMIN': 'Administrateur'
    };
    return roles[user.role] || user.role;
  };

  const getRoleIcon = () => {
    if (!user) return <Person />;
    switch(user.role) {
      case 'ETUDIANT': return <Person />;
      case 'FORMATEUR': return <School />;
      case 'ADMIN': return <AdminPanelSettings />;
      default: return <Person />;
    }
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', height: '100%' }}>
      {/* Header du drawer */}
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <School sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h6">
          {user ? `${user.prenom} ${user.nom}` : 'Gestion Scolaire'}
        </Typography>
        <Typography variant="caption" display="block">
          {getUserRoleDisplay()}
        </Typography>
      </Box>
      
      <Divider />
      
      {/* Menu items */}
      <List sx={{ flexGrow: 1 }}>
        {pages.map((page) => (
          <ListItem 
            key={page.name} 
            component={Link} 
            to={page.path}
            sx={{ 
              textDecoration: 'none', 
              color: 'inherit',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'primary.main' }}>
              {page.icon}
            </ListItemIcon>
            <ListItemText primary={page.name} />
          </ListItem>
        ))}
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

  if (!user) {
    return null; // Ne pas afficher la navbar si pas d'utilisateur connecté
  }

  return (
    <>
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

            {/* Menu desktop - affiché seulement si l'utilisateur a un rôle */}
            {user && (
              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                {pages.map((page) => (
                  <Button
                    key={page.name}
                    component={Link}
                    to={page.path}
                    sx={{ 
                      my: 2, 
                      color: 'white', 
                      display: 'block',
                      mx: 0.5,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                    startIcon={page.icon}
                  >
                    {page.name}
                  </Button>
                ))}
              </Box>
            )}

            {/* Notifications (optionnel) */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 2 }}>
              <Tooltip title="Notifications">
                <IconButton color="inherit">
                  <Badge badgeContent={3} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>
            </Box>

            {/* User menu */}
            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ mr: 2, textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {getUserDisplayName()}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {getUserRoleDisplay()}
                </Typography>
              </Box>
              
              <Tooltip title="Menu utilisateur">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar 
                    alt={getUserDisplayName()} 
                    sx={{ 
                      bgcolor: 'secondary.main',
                      width: 40,
                      height: 40
                    }}
                  >
                    {getUserDisplayName().charAt(0)}
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
                    {getRoleIcon()}
                  </ListItemIcon>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {getUserDisplayName()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getUserRoleDisplay()}
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
    </>
  );
};

export default Navbar;