import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppBar, Box, Toolbar, Typography, IconButton, Menu, MenuItem,
  Drawer, List, ListItem, ListItemIcon, ListItemText, Avatar, Container,
  CssBaseline, useTheme, useMediaQuery, Divider, Collapse, Tooltip
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import QrCodeIcon from '@mui/icons-material/QrCode';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History';
import GradeIcon from '@mui/icons-material/Grade';
import SickIcon from '@mui/icons-material/Sick';
import SettingsIcon from '@mui/icons-material/Settings';
import ClassIcon from '@mui/icons-material/Class';
import CampaignIcon from '@mui/icons-material/Campaign';

// --- PART 3 İÇİN EKLENEN İKONLAR ---
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import BuildIcon from '@mui/icons-material/Build'; // Ekipman için
import BarChartIcon from '@mui/icons-material/BarChart'; // Raporlar için
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import DescriptionIcon from '@mui/icons-material/Description';
import LanguageIcon from '@mui/icons-material/Language';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

const drawerWidth = 280;

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLanguage = () => {
    const languages = ['tr', 'en', 'it'];
    const currentIndex = languages.indexOf(i18n.language);
    const nextIndex = (currentIndex + 1) % languages.length;
    i18n.changeLanguage(languages[nextIndex]);
  };


  // --- MENÜ YAPILANDIRMASI ---

  // 1. Temel Menü (Herkes için)
  let menuItems = [
    { text: t('menu.dashboard'), icon: <DashboardIcon />, path: '/dashboard' },
    { text: t('menu.profile'), icon: <PersonIcon />, path: '/profile' },
  ];

  // 2. Kampüs Yaşamı (Part 3 - Ortak)
  menuItems.push(
    { text: t('menu.wallet'), icon: <AccountBalanceWalletIcon />, path: '/wallet' },
    { text: t('menu.schedule'), icon: <CalendarMonthIcon />, path: '/schedule' },
    { text: t('menu.menu'), icon: <RestaurantIcon />, path: '/meals/menu' },
    { text: t('menu.events'), icon: <EventIcon />, path: '/events' },
  );

  // 3. Rol Bazlı Linkler
  if (user) {
    if (user.role === 'student') {
      // Öğrenci Akademik
      menuItems.push(
        { text: t('menu.my_courses'), icon: <LibraryBooksIcon />, path: '/my-courses' },
        { text: t('menu.give_attendance'), icon: <QrCodeScannerIcon />, path: '/attendance/student' },
        { text: t('menu.attendance_history'), icon: <HistoryIcon />, path: '/attendance/my-history' },
        { text: t('menu.grades'), icon: <GradeIcon />, path: '/grades/my-grades' },
        { text: t('menu.excuse_request'), icon: <SickIcon />, path: '/attendance/excuse-request' },
        // Part 3 Detay
        { text: t('menu.reservations'), icon: <ConfirmationNumberIcon />, path: '/meals/reservations' },
        { text: t('menu.my_events'), icon: <ConfirmationNumberIcon />, path: '/my-events' }
      );
    }

    if (user.role === 'faculty') {
      // Hoca Akademik
      menuItems.push(
        { text: t('menu.start_attendance'), icon: <QrCodeIcon />, path: '/attendance/faculty' },
        { text: t('menu.reports'), icon: <AssessmentIcon />, path: '/attendance/reports' },
        { text: t('menu.grade_entry'), icon: <GradeIcon />, path: '/grades/gradebook' },
        { text: t('menu.excuse_approval'), icon: <SickIcon />, path: '/attendance/excuse-approval' },
        { text: t('menu.my_events'), icon: <ConfirmationNumberIcon />, path: '/my-events' }
      );
    }

    if (user.role === 'admin') {
      // Admin Yönetim
      menuItems.push(
        { text: t('menu.admin_dashboard'), icon: <BarChartIcon />, path: '/admin/dashboard' },
        { text: t('menu.audit_logs'), icon: <HistoryIcon />, path: '/admin/audit-logs' },
        { text: t('menu.course_management'), icon: <SettingsIcon />, path: '/admin/courses' },
        { text: t('menu.section_program'), icon: <ClassIcon />, path: '/admin/sections' },
        // Part 3 Yönetim
        { text: t('menu.menu_management'), icon: <RestaurantIcon />, path: '/admin/menus' },
        { text: t('menu.event_management'), icon: <EventIcon />, path: '/admin/events' },
        // Part 3: Yeni Eklenen Admin Sayfaları
        { text: t('menu.auto_schedule'), icon: <CalendarMonthIcon />, path: '/admin/scheduling/generate' },
        { text: t('menu.dept_schedules'), icon: <SchoolIcon />, path: '/admin/schedules/departments' },
        { text: t('menu.equipment_management'), icon: <BuildIcon />, path: '/admin/equipment' },
        { text: t('menu.resource_reports'), icon: <BarChartIcon />, path: '/admin/reports' }
      );
    }

    // Personel veya Admin için QR Okuyucu
    if (user.role === 'staff' || user.role === 'admin') {
      menuItems.push(
        { text: t('menu.qr_scanner'), icon: <QrCodeScannerIcon />, path: '/staff/scanner' }
      );
    }
  }

  // 4. Alt Menü (Genel)
  menuItems.push(
    { text: t('menu.notifications'), icon: <NotificationsIcon />, path: '/notifications' },
    { text: t('menu.course_catalog'), icon: <SchoolIcon />, path: '/courses' },
    { text: t('menu.announcements'), icon: <CampaignIcon />, path: '/announcements' },
  );

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: isDarkMode ? '#0f172a' : '#111827', color: 'white' }}>
      {/* Sidebar Header */}
      <Box sx={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        px: 3,
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 40, height: 40,
          bgcolor: theme.palette.primary.main,
          borderRadius: 2,
          mr: 2,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <SchoolIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5, color: 'white' }}>
          KampüsApp
        </Typography>
      </Box>

      {/* Menü Listesi */}
      <List sx={{ px: 2, py: 3, flexGrow: 1, overflowY: 'auto' }}>
        <Typography variant="caption" sx={{ px: 2, mb: 1, display: 'block', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
          {t('menu.menu_title')}
        </Typography>
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              button
              key={index} // text çakışması olmaması için index
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={{
                mb: 0.5,
                borderRadius: 2,
                transition: 'all 0.2s',
                bgcolor: isActive ? theme.palette.primary.main : 'transparent',
                color: isActive ? 'white' : '#9ca3af',
                '&:hover': {
                  bgcolor: isActive ? theme.palette.primary.dark : 'rgba(255,255,255,0.05)',
                  color: 'white'
                }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive ? 600 : 500 }} />
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <ListItem button onClick={() => navigate('/terms')} sx={{ borderRadius: 2, color: '#9ca3af', mb: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: 'white' } }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><DescriptionIcon /></ListItemIcon>
          <ListItemText primary={t('menu.terms')} primaryTypographyProps={{ fontSize: '0.9rem' }} />
        </ListItem>
        <ListItem button onClick={handleLogout} sx={{ borderRadius: 2, color: '#ef4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary={t('menu.logout')} />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      <CssBaseline />

      {/* Header (AppBar) */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
          color: 'text.primary',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ height: 64 }}>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          {/* Theme Toggle Button */}
          <Tooltip title={isDarkMode ? 'Açık Mod' : 'Koyu Mod'}>
            <IconButton
              onClick={toggleTheme}
              color="inherit"
              sx={{
                mr: 1,
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'rotate(180deg)' }
              }}
            >
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip
            title={
              i18n.language === 'tr'
                ? 'Switch to English'
                : i18n.language === 'en'
                  ? 'Passa all’italiano'
                  : 'Türkçe’ye geç'
            }
          >
            <IconButton
              onClick={changeLanguage}
              color="inherit"
              sx={{ mr: 1 }}
            >
              <LanguageIcon />
              <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 'bold' }}>
                {i18n.language.toUpperCase()}
              </Typography>
            </IconButton>
          </Tooltip>


          {/* Notification Bell */}
          <NotificationBell />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user && (
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{user.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {t(`roles.${user.role}`)}
                </Typography>
              </Box>
            )}
            <IconButton onClick={handleMenu} sx={{ p: 0.5, border: '2px solid transparent', '&:hover': { border: `2px solid ${theme.palette.primary.light}` } }}>
              <Avatar src={user?.profile_picture_url} sx={{ bgcolor: theme.palette.primary.main, width: 36, height: 36 }}>
                {user?.name?.charAt(0)}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.1))',
                mt: 1.5,
                borderRadius: 2,
                minWidth: 180
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => { navigate('/profile'); handleClose(); }} sx={{ py: 1.5 }}>{t('menu.profile_settings')}</MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main', py: 1.5 }}>{t('menu.logout')}</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar (Responsive) */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#111827' },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none', bgcolor: '#111827' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` }, p: 0 }}>
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4 } }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;