import React, { useState, useEffect } from 'react';
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
      toast.error('Rezervasyonlar yüklenemedi');
    }
  };

  const handleCreateReservation = async () => {
    if (!formData.classroomId || !formData.date || !formData.startTime || !formData.endTime || !formData.purpose) {
      toast.error('Tüm alanları doldurunuz');
      return;
    }

    try {
      await createClassroomReservation(formData);
      toast.success('Rezervasyon talebi oluşturuldu. Admin onayı bekleniyor.');
      setReservationModal({ open: false });
      setFormData({ classroomId: '', date: '', startTime: '', endTime: '', purpose: '' });
      fetchReservations();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Rezervasyon oluşturulamadı');
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveReservation(id);
      toast.success('Rezervasyon onaylandı');
      fetchReservations();
    } catch (error) {
      toast.error('Onaylama başarısız');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Rezervasyonu reddetmek istediğinize emin misiniz?')) return;
    try {
      await rejectReservation(id);
      toast.success('Rezervasyon reddedildi');
      fetchReservations();
    } catch (error) {
      toast.error('Reddetme başarısız');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'approved': return 'Onaylandı';
      case 'pending': return 'Beklemede';
      case 'rejected': return 'Reddedildi';
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
              Derslik Rezervasyonları
            </Typography>
          </Box>
          {!isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={() => setReservationModal({ open: true })}
            >
              Yeni Rezervasyon
            </Button>
          )}
        </Box>

        {/* Filtreler (Admin için) */}
        {isAdmin && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Durum</InputLabel>
                  <Select
                    value={filters.status}
                    label="Durum"
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <MenuItem value="all">Tümü</MenuItem>
                    <MenuItem value="pending">Beklemede</MenuItem>
                    <MenuItem value="approved">Onaylandı</MenuItem>
                    <MenuItem value="rejected">Reddedildi</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Tarih"
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
              Rezervasyon bulunamadı.
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
                      <strong>Tarih:</strong> {new Date(reservation.date).toLocaleDateString('tr-TR')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Saat:</strong> {reservation.start_time} - {reservation.end_time}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Amaç:</strong> {reservation.purpose}
                    </Typography>
                    {reservation.user && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Rezerve Eden:</strong> {reservation.user.name}
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
                          Onayla
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={() => handleReject(reservation.id)}
                        >
                          Reddet
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
          <DialogTitle>Yeni Derslik Rezervasyonu</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              Rezervasyon talebiniz admin onayından sonra aktif olacaktır.
            </Alert>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Derslik ID"
                  value={formData.classroomId}
                  onChange={(e) => setFormData({ ...formData, classroomId: e.target.value })}
                  placeholder="Örn: A101"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Tarih"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Başlangıç"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Bitiş"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amaç"
                  multiline
                  rows={3}
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="Rezervasyon amacınızı belirtiniz..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReservationModal({ open: false })}>
              İptal
            </Button>
            <Button variant="contained" onClick={handleCreateReservation}>
              Rezervasyon Oluştur
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default ClassroomReservations;

