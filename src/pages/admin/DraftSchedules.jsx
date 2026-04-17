import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Paper, Typography, Button, Box, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';
import {
  getDraftSchedules,
  approveDraftSchedule,
  rejectDraftSchedule
} from '../../services/scheduleService';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';
import DraftsIcon from '@mui/icons-material/Drafts';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import SchedulePreview from '../../components/SchedulePreview';

const DraftSchedules = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState([]);
  const [totalDrafts, setTotalDrafts] = useState(0);
  const [error, setError] = useState(null);

  // Filters
  const [semester, setSemester] = useState('');
  const [year, setYear] = useState('');

  // Modals
  const [previewModal, setPreviewModal] = useState({ open: false, draft: null });
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, draft: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDrafts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (semester) params.semester = semester;
      if (year) params.year = year;

      const res = await getDraftSchedules(params);

      if (res.data.success) {
        setDrafts(res.data.data || []);
        setTotalDrafts(res.data.totalDrafts || 0);
      } else {
        setError(res.data.message || t('draft_schedules.load_error'));
      }
    } catch (err) {
      console.error('Taslak listeleme hatası:', err);
      setError(err.response?.data?.message || t('draft_schedules.load_error'));
    } finally {
      setLoading(false);
    }
  }, [semester, year]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const handlePreview = (draft) => {
    setPreviewModal({ open: true, draft });
  };

  const handleApprove = (draft) => {
    setConfirmModal({ open: true, type: 'approve', draft });
  };

  const handleReject = (draft) => {
    setConfirmModal({ open: true, type: 'reject', draft });
  };

  const confirmAction = async () => {
    const { type, draft } = confirmModal;
    if (!draft) return;

    try {
      setActionLoading(true);

      if (type === 'approve') {
        const res = await approveDraftSchedule(draft.batchId, { archiveExisting: true });
        if (res.data.success) {
          toast.success(res.data.message || t('draft_schedules.success_approve'));
        } else {
          toast.error(res.data.message || t('draft_schedules.error_approve'));
        }
      } else if (type === 'reject') {
        const res = await rejectDraftSchedule(draft.batchId);
        if (res.data.success) {
          toast.success(res.data.message || t('draft_schedules.success_reject'));
        } else {
          toast.error(res.data.message || t('draft_schedules.error_reject'));
        }
      }

      setConfirmModal({ open: false, type: null, draft: null });
      fetchDrafts();
    } catch (err) {
      console.error(`${type} hatası:`, err);
      toast.error(err.response?.data?.message || t('draft_schedules.error_approve'));
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString(i18n.language, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScheduleCount = (draft) => {
    return draft.schedules?.length || draft.stats?.totalCourses || 0;
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <DraftsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {t('draft_schedules.title')}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDrafts}
            disabled={loading}
          >
            {t('draft_schedules.refresh')}
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            {t('draft_schedules.info_message')}
          </Typography>
        </Alert>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('draft_schedules.semester')}</InputLabel>
                <Select
                  value={semester}
                  label={t('draft_schedules.semester')}
                  onChange={(e) => setSemester(e.target.value)}
                >
                  <MenuItem value="">{t('draft_schedules.all')}</MenuItem>
                  <MenuItem value="Fall">{t('draft_schedules.fall')}</MenuItem>
                  <MenuItem value="Spring">{t('draft_schedules.spring')}</MenuItem>
                  <MenuItem value="Summer">{t('draft_schedules.summer')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('draft_schedules.year')}</InputLabel>
                <Select
                  value={year}
                  label={t('draft_schedules.year')}
                  onChange={(e) => setYear(e.target.value)}
                >
                  <MenuItem value="">{t('draft_schedules.all')}</MenuItem>
                  {[2024, 2025, 2026].map((y) => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Chip
                label={t('draft_schedules.total_drafts', { count: totalDrafts })}
                color="primary"
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : drafts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <DraftsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {t('draft_schedules.no_drafts')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('draft_schedules.no_drafts_hint')}
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>{t('draft_schedules.batch_id')}</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>{t('draft_schedules.created_at')}</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>{t('draft_schedules.course_count')}</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>{t('draft_schedules.status')}</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">{t('draft_schedules.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {drafts.map((draft) => (
                  <TableRow key={draft.batchId} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {draft.batchId?.slice(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(draft.createdAt)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={`${getScheduleCount(draft)} ${t('common.course', { count: getScheduleCount(draft) })}`}
                        color="info"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={t('draft_schedules.status_draft')}
                        color="warning"
                        icon={<DraftsIcon />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        <Tooltip title={t('draft_schedules.preview')}>
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handlePreview(draft)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('draft_schedules.approve')}>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApprove(draft)}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('draft_schedules.reject')}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleReject(draft)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Preview Modal */}
        <Dialog
          open={previewModal.open}
          onClose={() => setPreviewModal({ open: false, draft: null })}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <VisibilityIcon color="primary" />
              {t('draft_schedules.preview_title')}
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {previewModal.draft && (
              <SchedulePreview
                schedules={previewModal.draft.schedules || []}
                stats={previewModal.draft.stats}
                batchId={previewModal.draft.batchId}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewModal({ open: false, draft: null })}>
              {t('draft_schedules.close')}
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => {
                setPreviewModal({ open: false, draft: null });
                handleApprove(previewModal.draft);
              }}
            >
              {t('draft_schedules.approve')}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => {
                setPreviewModal({ open: false, draft: null });
                handleReject(previewModal.draft);
              }}
            >
              {t('draft_schedules.reject')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Modal */}
        <Dialog
          open={confirmModal.open}
          onClose={() => setConfirmModal({ open: false, type: null, draft: null })}
        >
          <DialogTitle>
            {confirmModal.type === 'approve' ? t('draft_schedules.confirm_approve_title') : t('draft_schedules.confirm_reject_title')}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {confirmModal.type === 'approve'
                ? t('draft_schedules.confirm_approve_msg')
                : t('draft_schedules.confirm_reject_msg')}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setConfirmModal({ open: false, type: null, draft: null })}
              disabled={actionLoading}
            >
              {t('draft_schedules.cancel')}
            </Button>
            <Button
              variant="contained"
              color={confirmModal.type === 'approve' ? 'success' : 'error'}
              onClick={confirmAction}
              disabled={actionLoading}
              startIcon={actionLoading ? <CircularProgress size={16} /> : null}
            >
              {confirmModal.type === 'approve' ? t('draft_schedules.approve') : t('draft_schedules.reject')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default DraftSchedules;
