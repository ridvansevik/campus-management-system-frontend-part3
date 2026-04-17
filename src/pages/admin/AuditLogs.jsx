import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Tooltip,
    Card,
    CardContent,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as ViewIcon,
    Refresh as RefreshIcon,
    FilterList as FilterIcon,
    Login as LoginIcon,
    Logout as LogoutIcon,
    Add as CreateIcon,
    Edit as UpdateIcon,
    Delete as DeleteIcon,
    Download as ExportIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import auditLogService from '../../services/auditLogService';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

// Aksiyon renkleri
const actionColors = {
    login_success: 'success',
    login_failed: 'error',
    logout: 'default',
    create: 'primary',
    update: 'warning',
    delete: 'error',
    view: 'info',
    export: 'secondary',
    password_reset: 'warning'
};

// Aksiyon ikonları
const actionIcons = {
    login_success: <LoginIcon fontSize="small" />,
    login_failed: <LoginIcon fontSize="small" />,
    logout: <LogoutIcon fontSize="small" />,
    create: <CreateIcon fontSize="small" />,
    update: <UpdateIcon fontSize="small" />,
    delete: <DeleteIcon fontSize="small" />,
    view: <ViewIcon fontSize="small" />,
    export: <ExportIcon fontSize="small" />,
    password_reset: <PersonIcon fontSize="small" />
};

const getActionNames = (t) => ({
    login_success: t('audit_logs.actions.login_success'),
    login_failed: t('audit_logs.actions.login_failed'),
    logout: t('audit_logs.actions.logout'),
    create: t('audit_logs.actions.create'),
    update: t('audit_logs.actions.update'),
    delete: t('audit_logs.actions.delete'),
    view: t('audit_logs.actions.view'),
    export: t('audit_logs.actions.export'),
    password_reset: t('audit_logs.actions.password_reset')
});

const AuditLogs = () => {
    const { t, i18n } = useTranslation();
    const actionNames = getActionNames(t);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 0, total: 0, limit: 25 });
    const [filters, setFilters] = useState({ action: '', search: '' });
    const [selectedLog, setSelectedLog] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [stats, setStats] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page + 1,
                limit: pagination.limit,
                ...filters
            };

            const response = await auditLogService.getAuditLogs(params);
            if (response.success) {
                setLogs(response.data.logs);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination.total
                }));
            }
        } catch (error) {
            toast.error(t('audit_logs.load_error'));
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await auditLogService.getAuditStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Stats yüklenemedi:', error);
        }
    };

    useEffect(() => {
        fetchLogs();
        fetchStats();
    }, [pagination.page, pagination.limit]);

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 0 }));
        fetchLogs();
    };

    const handleViewDetail = (log) => {
        setSelectedLog(log);
        setDetailOpen(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';

        if (isNaN(date.getTime())) return '-';

        return date.toLocaleString(i18n.language, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
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
                <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                        {t('audit_logs.title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('audit_logs.subtitle')}
                    </Typography>
                </Box>
                <Tooltip title={t('audit_logs.refresh')}>
                    <IconButton onClick={() => { fetchLogs(); fetchStats(); }} color="primary">
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Stats Cards */}
            {stats && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}>
                        <Card sx={{ bgcolor: '#10b98120' }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h4" fontWeight={700} color="#10b981">
                                    {stats.loginStats?.successful || 0}
                                </Typography>
                                <Typography variant="body2">{t('audit_logs.stats_successful_login')}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Card sx={{ bgcolor: '#ef444420' }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h4" fontWeight={700} color="#ef4444">
                                    {stats.loginStats?.failed || 0}
                                </Typography>
                                <Typography variant="body2">{t('audit_logs.stats_failed_login')}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Card sx={{ bgcolor: '#4f46e520' }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h4" fontWeight={700} color="#4f46e5">
                                    {stats.last24HoursCount || 0}
                                </Typography>
                                <Typography variant="body2">{t('audit_logs.stats_last_24h')}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Card sx={{ bgcolor: '#f59e0b20' }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h4" fontWeight={700} color="#f59e0b">
                                    {stats.mostActiveUsers?.length || 0}
                                </Typography>
                                <Typography variant="body2">{t('audit_logs.stats_active_users')}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            size="small"
                            label={t('audit_logs.search_placeholder')}
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            InputProps={{
                                endAdornment: (
                                    <IconButton size="small" onClick={handleSearch}>
                                        <SearchIcon />
                                    </IconButton>
                                )
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>{t('audit_logs.action_label')}</InputLabel>
                            <Select
                                value={filters.action}
                                label={t('audit_logs.action_label')}
                                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                            >
                                <MenuItem value="">{t('audit_logs.all')}</MenuItem>
                                {Object.keys(actionNames).map(key => (
                                    <MenuItem key={key} value={key}>{actionNames[key]}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Button
                            variant="contained"
                            onClick={handleSearch}
                            startIcon={<FilterIcon />}
                            fullWidth
                        >
                            {t('audit_logs.filter_btn')}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Table */}
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'action.hover' }}>
                                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{t('audit_logs.table_date')}</TableCell>
                                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{t('audit_logs.table_user')}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{t('audit_logs.table_action')}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{t('audit_logs.table_entity')}</TableCell>
                                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{t('audit_logs.table_ip')}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{t('audit_logs.table_description')}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600 }}>{t('audit_logs.table_detail')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log.id} hover>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            <Typography variant="body2">
                                                {formatDate(log.createdAt || log.created_at)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            {log.user ? (
                                                <Box>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {log.user.name || log.user.email}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {log.user.role}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Chip label={t('audit_logs.system')} size="small" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={actionIcons[log.action]}
                                                label={actionNames[log.action] || log.action}
                                                size="small"
                                                color={actionColors[log.action] || 'default'}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {log.entity_type || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            <Typography variant="body2" fontFamily="monospace">
                                                {log.ip_address || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    maxWidth: 200,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {log.description || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Detay">
                                                <IconButton size="small" onClick={() => handleViewDetail(log)}>
                                                    <ViewIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {logs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">{t('audit_logs.no_logs')}</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        <TablePagination
                            component="div"
                            count={pagination.total}
                            page={pagination.page}
                            onPageChange={(e, newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
                            rowsPerPage={pagination.limit}
                            onRowsPerPageChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 0 }))}
                            labelRowsPerPage={isMobile ? '' : t('audit_logs.rows_per_page')}
                            rowsPerPageOptions={[10, 25, 50, 100]}
                        />
                    </>
                )}
            </TableContainer>

            {/* Detail Dialog */}
            <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth fullScreen={isMobile}>
                <DialogTitle>
                    {t('audit_logs.dialog_title')}
                </DialogTitle>
                <DialogContent dividers>
                    {selectedLog && (
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">{t('audit_logs.table_date')}</Typography>
                                <Typography>{formatDate(selectedLog.createdAt || selectedLog.created_at)}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">{t('audit_logs.table_user')}</Typography>
                                <Typography>{selectedLog.user?.email || t('audit_logs.system')}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">{t('audit_logs.table_action')}</Typography>
                                <Chip
                                    label={actionNames[selectedLog.action] || selectedLog.action}
                                    color={actionColors[selectedLog.action] || 'default'}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">{t('audit_logs.table_entity')}</Typography>
                                <Typography>{selectedLog.entity_type || '-'}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">{t('audit_logs.table_ip')}</Typography>
                                <Typography fontFamily="monospace">{selectedLog.ip_address || '-'}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">{t('audit_logs.dialog_request_url')}</Typography>
                                <Typography fontFamily="monospace" fontSize="0.85rem">
                                    {selectedLog.request_method} {selectedLog.request_url || '-'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">{t('audit_logs.table_description')}</Typography>
                                <Typography>{selectedLog.description || '-'}</Typography>
                            </Grid>
                            {selectedLog.old_value && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">{t('audit_logs.dialog_old_value')}</Typography>
                                    <Paper sx={{ p: 1, bgcolor: '#fef2f2' }}>
                                        <pre style={{ margin: 0, fontSize: '0.8rem', overflow: 'auto' }}>
                                            {JSON.stringify(selectedLog.old_value, null, 2)}
                                        </pre>
                                    </Paper>
                                </Grid>
                            )}
                            {selectedLog.new_value && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">{t('audit_logs.dialog_new_value')}</Typography>
                                    <Paper sx={{ p: 1, bgcolor: '#f0fdf4' }}>
                                        <pre style={{ margin: 0, fontSize: '0.8rem', overflow: 'auto' }}>
                                            {JSON.stringify(selectedLog.new_value, null, 2)}
                                        </pre>
                                    </Paper>
                                </Grid>
                            )}
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">{t('audit_logs.dialog_user_agent')}</Typography>
                                <Typography variant="body2" fontSize="0.8rem" color="text.secondary">
                                    {selectedLog.user_agent || '-'}
                                </Typography>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailOpen(false)}>{t('audit_logs.close')}</Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
};

export default AuditLogs;
