import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Typography,
    Box,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Button,
    ButtonGroup,
    Divider,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Switch,
    FormControlLabel,
    FormGroup,
    Grid,
    Tooltip,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    CheckCircle as SuccessIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    School as AcademicIcon,
    AccessTime as AttendanceIcon,
    Restaurant as MealIcon,
    Event as EventIcon,
    Payment as PaymentIcon,
    Settings as SystemIcon,
    Delete as DeleteIcon,
    DoneAll as ReadAllIcon,
    DeleteSweep as ClearAllIcon,
    Settings as SettingsIcon,
    Markunread as UnreadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import notificationService from '../services/notificationService';

// Kategori ikonları
const categoryIcons = {
    academic: <AcademicIcon />,
    attendance: <AttendanceIcon />,
    meal: <MealIcon />,
    event: <EventIcon />,
    payment: <PaymentIcon />,
    system: <SystemIcon />
};

// Kategori renkleri
const categoryColors = {
    academic: '#4f46e5',
    attendance: '#ec4899',
    meal: '#ff9800',
    event: '#9c27b0',
    payment: '#4caf50',
    system: '#6b7280'
};

// Kategori isimleri
// Kategori isimleri (Kaldırıldı - t fonksiyonu kullanılacak)
// Ancak anahtarlar lazım
const categoryKeys = ['academic', 'attendance', 'meal', 'event', 'payment', 'system'];

const Notifications = () => {
    const { t, i18n } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [activeTab, setActiveTab] = useState('all');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [preferences, setPreferences] = useState(null);
    const [preferencesLoading, setPreferencesLoading] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Bildirimleri yükle
    const fetchNotifications = async (page = 1, category = null) => {
        try {
            setLoading(true);
            const params = { page, limit: 20 };
            if (category && category !== 'all' && category !== 'unread') {
                params.category = category;
            }
            if (category === 'unread') {
                params.is_read = false;
            }

            const response = await notificationService.getNotifications(params);
            if (response.success) {
                setNotifications(response.data.notifications);
                setUnreadCount(response.data.unreadCount);
                setPagination({
                    page: response.data.pagination.page,
                    totalPages: response.data.pagination.totalPages
                });
            }
        } catch (error) {
            toast.error(t('notifications.load_failed'));
        } finally {
            setLoading(false);
        }
    };

    // Tercihleri yükle
    const fetchPreferences = async () => {
        try {
            setPreferencesLoading(true);
            const response = await notificationService.getPreferences();
            if (response.success) {
                setPreferences(response.data);
            }
        } catch (error) {
            toast.error(t('notifications.preferences_load_failed'));
        } finally {
            setPreferencesLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Tab değiştiğinde
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        fetchNotifications(1, newValue);
    };

    // Bildirimi okundu işaretle
    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            toast.error(t('notifications.operation_failed'));
        }
    };

    // Tümünü okundu işaretle
    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
            setUnreadCount(0);
            toast.success(t('notifications.all_read_success'));
        } catch (error) {
            toast.error(t('notifications.operation_failed'));
        }
    };

    // Bildirimi sil
    const handleDelete = async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            toast.success(t('notifications.deleted'));
        } catch (error) {
            toast.error(t('notifications.operation_failed'));
        }
    };

    // Tümünü sil
    const handleClearAll = async () => {
        if (!window.confirm(t('notifications.confirm_clear'))) return;

        try {
            await notificationService.clearAllNotifications();
            setNotifications([]);
            setUnreadCount(0);
            toast.success(t('notifications.all_deleted'));
        } catch (error) {
            toast.error(t('notifications.operation_failed'));
        }
    };

    // Tercihleri güncelle
    const handlePreferenceChange = async (field, value) => {
        try {
            const newPreferences = { ...preferences, [field]: value };
            setPreferences(newPreferences);
            await notificationService.updatePreferences({ [field]: value });
        } catch (error) {
            toast.error(t('notifications.preference_update_failed'));
        }
    };

    // Bildirime tıkla
    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            await handleMarkAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    // Tarih formatla
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString(i18n.language, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Layout>
            {/* Header */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2,
                mb: 3
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <NotificationsIcon sx={{ fontSize: { xs: 28, sm: 32 }, color: 'primary.main' }} />
                    <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                        {t('notifications.title')}
                    </Typography>
                    {unreadCount > 0 && (
                        <Chip
                            label={isMobile ? unreadCount : `${unreadCount} ${t('notifications.unread')}`}
                            color="error"
                            size="small"
                        />
                    )}
                </Box>
                <Box>
                    <Tooltip title={t('common.settings')}>
                        <IconButton onClick={() => { setSettingsOpen(true); fetchPreferences(); }}>
                            <SettingsIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                {isMobile ? (
                    <>
                        <Tooltip title={t('notifications.mark_all_read')}>
                            <span>
                                <IconButton
                                    color="primary"
                                    onClick={handleMarkAllRead}
                                    disabled={unreadCount === 0}
                                    sx={{ border: '1px solid', borderColor: 'divider' }}
                                >
                                    <ReadAllIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title={t('notifications.clear_all')}>
                            <span>
                                <IconButton
                                    color="error"
                                    onClick={handleClearAll}
                                    disabled={notifications.length === 0}
                                    sx={{ border: '1px solid', borderColor: 'divider' }}
                                >
                                    <ClearAllIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </>
                ) : (
                    <>
                        <Button
                            variant="outlined"
                            startIcon={<ReadAllIcon />}
                            onClick={handleMarkAllRead}
                            disabled={unreadCount === 0}
                        >
                            {t('notifications.mark_all_read')}
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<ClearAllIcon />}
                            onClick={handleClearAll}
                            disabled={notifications.length === 0}
                        >
                            {t('notifications.clear_all')}
                        </Button>
                    </>
                )}
            </Box>

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label={t('notifications.all')} value="all" />
                    <Tab
                        label={`${t('notifications.unread')} (${unreadCount})`}
                        value="unread"
                        icon={<UnreadIcon />}
                        iconPosition="start"
                    />
                    <Tab label={t('notifications.category.academic')} value="academic" />
                    <Tab label={t('notifications.category.attendance')} value="attendance" />
                    <Tab label={t('notifications.category.meal')} value="meal" />
                    <Tab label={t('notifications.category.event')} value="event" />
                    <Tab label={t('notifications.category.payment')} value="payment" />
                    <Tab label={t('notifications.category.system')} value="system" />
                </Tabs>
            </Paper>

            {/* Notification List */}
            <Paper>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <NotificationsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            {t('notifications.no_notifications')}
                        </Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {notifications.map((notification, index) => (
                            <Box key={notification.id}>
                                <ListItem
                                    button
                                    onClick={() => handleNotificationClick(notification)}
                                    sx={{
                                        py: { xs: 1.5, sm: 2 },
                                        px: { xs: 1.5, sm: 3 },
                                        pr: { xs: 6, sm: 8 },
                                        backgroundColor: notification.is_read ? 'transparent' : 'rgba(79, 70, 229, 0.04)',
                                        borderLeft: `4px solid ${categoryColors[notification.category] || '#6b7280'}`,
                                        '&:hover': {
                                            backgroundColor: 'rgba(0,0,0,0.04)'
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: { xs: 36, sm: 48 } }}>
                                        {categoryIcons[notification.category]}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: { xs: 'column', sm: 'row' },
                                                alignItems: { xs: 'flex-start', sm: 'center' },
                                                gap: { xs: 0.5, sm: 1 }
                                            }}>
                                                <Typography
                                                    fontWeight={notification.is_read ? 400 : 600}
                                                    sx={{
                                                        fontSize: { xs: '0.9rem', sm: '1rem' },
                                                        wordBreak: 'break-word'
                                                    }}
                                                >
                                                    {notification.title}
                                                </Typography>
                                                <Chip
                                                    label={t(`notifications.category.${notification.category}`)}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: categoryColors[notification.category],
                                                        color: 'white',
                                                        fontSize: '0.65rem',
                                                        height: 18,
                                                        flexShrink: 0
                                                    }}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        mt: 0.5,
                                                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                                        wordBreak: 'break-word'
                                                    }}
                                                >
                                                    {notification.message}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.disabled"
                                                    sx={{
                                                        mt: 0.5,
                                                        display: 'block',
                                                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                                    }}
                                                >
                                                    {formatDate(notification.createdAt)}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                    <ListItemSecondaryAction sx={{ right: { xs: 8, sm: 16 } }}>
                                        <Tooltip title={t('common.delete')}>
                                            <IconButton
                                                edge="end"
                                                size={isMobile ? 'small' : 'medium'}
                                                onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                                            >
                                                <DeleteIcon fontSize={isMobile ? 'small' : 'medium'} />
                                            </IconButton>
                                        </Tooltip>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {index < notifications.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </List>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <ButtonGroup variant="outlined" size="small">
                            <Button
                                disabled={pagination.page === 1}
                                onClick={() => fetchNotifications(pagination.page - 1, activeTab)}
                            >
                                {t('notifications.previous')}
                            </Button>
                            <Button disabled>
                                {pagination.page} / {pagination.totalPages}
                            </Button>
                            <Button
                                disabled={pagination.page === pagination.totalPages}
                                onClick={() => fetchNotifications(pagination.page + 1, activeTab)}
                            >
                                {t('notifications.next')}
                            </Button>
                        </ButtonGroup>
                    </Box>
                )}
            </Paper>

            {/* Settings Dialog */}
            <Dialog
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                maxWidth="sm"
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SettingsIcon />
                        {t('notifications.preferences')}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {preferencesLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : preferences ? (
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            {/* Email Preferences */}
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                    {t('notifications.email')}
                                </Typography>
                                <FormGroup>
                                    {categoryKeys.map(category => (
                                        <FormControlLabel
                                            key={`email_${category}`}
                                            control={
                                                <Switch
                                                    checked={preferences[`email_${category}`] ?? true}
                                                    onChange={(e) => handlePreferenceChange(`email_${category}`, e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label={t(`notifications.category.${category}`)}
                                        />
                                    ))}
                                </FormGroup>
                            </Grid>

                            {/* Push Preferences */}
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                    {t('notifications.push')}
                                </Typography>
                                <FormGroup>
                                    {categoryKeys.map(category => (
                                        <FormControlLabel
                                            key={`push_${category}`}
                                            control={
                                                <Switch
                                                    checked={preferences[`push_${category}`] ?? true}
                                                    onChange={(e) => handlePreferenceChange(`push_${category}`, e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label={t(`notifications.category.${category}`)}
                                        />
                                    ))}
                                </FormGroup>
                            </Grid>
                        </Grid>
                    ) : (
                        <Alert severity="error">{t('notifications.preferences_load_failed')}</Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSettingsOpen(false)}>{t('common.close')}</Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
};

export default Notifications;

