import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container, Paper, Typography, Button, Box, Grid, Card, CardContent,
  TextField, FormControl, InputLabel, Select, MenuItem, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert, Table, TableBody,
  TableCell, TableHead, TableRow
} from '@mui/material';
import {
  createClassroomReservation, getClassroomReservations,
  approveReservation, rejectReservation
} from '../services/scheduleService';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../context/AuthContext';

const ClassroomReservations = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [reservationModal, setReservationModal] = useState({ open: false });
  const [formData, setFormData] = useState({
    classroomId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: ''
  });
  const [filters, setFilters] = useState({
    status: 'all',
    date: '',
    classroomId: ''
  });

  useEffect(() => {
    fetchReservations();
    // fetchClassrooms(); // Backend'den derslik listesi çekilebilir
  }, [filters]);

  const fetchReservations = async () => {
    try {
      const res = await getClassroomReservations(filters);
      setReservations(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error(t('classroom_reservations.actions.load_error') || 'Rezervasyonlar yüklenemedi');
    }
  };

  const handleCreateReservation = async () => {
    if (!formData.classroomId || !formData.date || !formData.startTime || !formData.endTime || !formData.purpose) {
      toast.error(t('classroom_reservations.actions.fill_all'));
      return;
    }

    try {
      await createClassroomReservation(formData);
      toast.success(t('classroom_reservations.actions.success_create'));
      setReservationModal({ open: false });
      setFormData({ classroomId: '', date: '', startTime: '', endTime: '', purpose: '' });
      fetchReservations();
    } catch (error) {
      toast.error(error.response?.data?.error || t('classroom_reservations.actions.error_create'));
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveReservation(id);
      toast.success(t('classroom_reservations.actions.success_approve'));
      fetchReservations();
    } catch (error) {
      toast.error(t('classroom_reservations.actions.error_operation'));
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm(t('classroom_reservations.actions.confirm_reject'))) return;
    try {
      await rejectReservation(id);
      toast.success(t('classroom_reservations.actions.success_reject'));
      fetchReservations();
    } catch (error) {
      toast.error(t('classroom_reservations.actions.error_operation'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved': return t('classroom_reservations.filter.approved');
      case 'pending': return t('classroom_reservations.filter.pending');
      case 'rejected': return t('classroom_reservations.filter.rejected');
      default: return status;
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <MeetingRoomIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {t('classroom_reservations.title')}
            </Typography>
          </Box>
          {!isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={() => setReservationModal({ open: true })}
            >
              {t('classroom_reservations.new_reservation')}
            </Button>
          )}
        </Box>

        {/* Filtreler (Admin için) */}
        {isAdmin && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>{t('classroom_reservations.filter.status')}</InputLabel>
                  <Select
                    value={filters.status}
                    label={t('classroom_reservations.filter.status')}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <MenuItem value="all">{t('classroom_reservations.filter.all')}</MenuItem>
                    <MenuItem value="pending">{t('classroom_reservations.filter.pending')}</MenuItem>
                    <MenuItem value="approved">{t('classroom_reservations.filter.approved')}</MenuItem>
                    <MenuItem value="rejected">{t('classroom_reservations.filter.rejected')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label={t('classroom_reservations.filter.date')}
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Rezervasyon Listesi */}
        {reservations.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {t('classroom_reservations.no_reservations')}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {reservations.map((reservation) => (
              <Grid item xs={12} md={6} key={reservation.id}>
                <Card elevation={2}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6">
                        {reservation.classroom?.code || `Derslik #${reservation.classroom_id}`}
                      </Typography>
                      <Chip
                        label={getStatusLabel(reservation.status)}
                        color={getStatusColor(reservation.status)}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>{t('classroom_reservations.card.date')}:</strong> {new Date(reservation.date).toLocaleDateString(i18n.language)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>{t('classroom_reservations.card.time')}:</strong> {reservation.start_time} - {reservation.end_time}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>{t('classroom_reservations.card.purpose')}:</strong> {reservation.purpose}
                    </Typography>
                    {reservation.user && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>{t('classroom_reservations.card.reserved_by')}:</strong> {reservation.user.name}
                      </Typography>
                    )}

                    {isAdmin && reservation.status === 'pending' && (
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleApprove(reservation.id)}
                        >
                          {t('classroom_reservations.actions.approve')}
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={() => handleReject(reservation.id)}
                        >
                          {t('classroom_reservations.actions.reject')}
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Yeni Rezervasyon Modal */}
        <Dialog
          open={reservationModal.open}
          onClose={() => setReservationModal({ open: false })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t('classroom_reservations.new_modal.title')}</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              {t('classroom_reservations.new_modal.alert_info')}
            </Alert>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('classroom_reservations.new_modal.classroom_id')}
                  value={formData.classroomId}
                  onChange={(e) => setFormData({ ...formData, classroomId: e.target.value })}
                  placeholder="Örn: A101"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label={t('classroom_reservations.new_modal.date')}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="time"
                  label={t('classroom_reservations.new_modal.start')}
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="time"
                  label={t('classroom_reservations.new_modal.end')}
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('classroom_reservations.new_modal.purpose')}
                  multiline
                  rows={3}
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder={t('classroom_reservations.new_modal.placeholder')}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReservationModal({ open: false })}>
              {t('classroom_reservations.new_modal.cancel')}
            </Button>
            <Button variant="contained" onClick={handleCreateReservation}>
              {t('classroom_reservations.new_modal.create')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default ClassroomReservations;

