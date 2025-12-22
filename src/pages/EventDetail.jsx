import React, { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, Button, Box, Chip, Grid, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider, Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventDetail, registerEvent } from '../services/eventService';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { QRCodeSVG } from 'qrcode.react';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registerModal, setRegisterModal] = useState({ open: false, customFields: {} });
  const [registrationSuccess, setRegistrationSuccess] = useState(null);

  useEffect(() => {
    fetchEventDetail();
  }, [id]);

  const fetchEventDetail = async () => {
    try {
      setLoading(true);
      const res = await getEventDetail(id);
      setEvent(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Etkinlik yüklenemedi');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      const res = await registerEvent(id, registerModal.customFields);
      toast.success('Etkinliğe başarıyla kayıt oldunuz!');
      setRegistrationSuccess(res.data.data);
      setRegisterModal({ open: false, customFields: {} });
      fetchEventDetail(); // Kontenjan güncellemesi için
    } catch (error) {
      toast.error(error.response?.data?.error || 'Kayıt başarısız');
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Typography>Yükleniyor...</Typography>
        </Container>
      </Layout>
    );
  }

  if (!event) {
    return null;
  }

  const isFull = event.registered_count >= event.capacity;
  const isDeadlinePassed = event.registration_deadline && new Date(event.registration_deadline) < new Date();
  const canRegister = !isFull && !isDeadlinePassed;

  return (
    <Layout>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/events')}
          sx={{ mb: 2 }}
        >
          Geri Dön
        </Button>

        <Paper sx={{ p: 4, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
              {event.title}
            </Typography>
            <Chip label={event.category} color="primary" />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body1" color="text.secondary" paragraph>
            {event.description}
          </Typography>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <EventIcon color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">Tarih</Typography>
                  <Typography variant="body1">
                    {new Date(event.date).toLocaleDateString('tr-TR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <AccessTimeIcon color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">Saat</Typography>
                  <Typography variant="body1">
                    {event.start_time} - {event.end_time}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <LocationOnIcon color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">Konum</Typography>
                  <Typography variant="body1">{event.location}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <PeopleIcon color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">Kontenjan</Typography>
                  <Typography 
                    variant="body1"
                    color={isFull ? 'error.main' : 'success.main'}
                    fontWeight="bold"
                  >
                    {event.registered_count} / {event.capacity}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {event.is_paid && event.price > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Bu etkinlik ücretlidir: <strong>{event.price} ₺</strong>
            </Alert>
          )}

          {event.registration_deadline && (
            <Alert 
              severity={isDeadlinePassed ? 'error' : 'warning'} 
              sx={{ mt: 2 }}
            >
              Son kayıt tarihi: {new Date(event.registration_deadline).toLocaleDateString('tr-TR')}
              {isDeadlinePassed && ' (Süresi dolmuş)'}
            </Alert>
          )}

          {isFull && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Kontenjan dolu
            </Alert>
          )}

          <Box sx={{ mt: 3 }}>
            <Button 
              variant="contained" 
              size="large" 
              fullWidth
              onClick={() => setRegisterModal({ open: true, customFields: {} })}
              disabled={!canRegister}
            >
              {isFull ? 'Kontenjan Dolu' : isDeadlinePassed ? 'Kayıt Süresi Dolmuş' : 'Kayıt Ol'}
            </Button>
          </Box>
        </Paper>

        {/* Kayıt Başarı Modal */}
        {registrationSuccess && (
          <Dialog open={!!registrationSuccess} onClose={() => setRegistrationSuccess(null)} maxWidth="sm" fullWidth>
            <DialogTitle>Kayıt Başarılı!</DialogTitle>
            <DialogContent>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                {registrationSuccess.qrCodeImage && (
                  <>
                    <QRCodeSVG value={registrationSuccess.qr_code || registrationSuccess.qrCodeImage} size={250} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Etkinlik girişinde bu QR kodu gösteriniz.
                    </Typography>
                  </>
                )}
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Etkinliğe başarıyla kayıt oldunuz!
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setRegistrationSuccess(null);
                navigate('/my-events');
              }}>
                Kayıtlı Etkinliklerim
              </Button>
              <Button variant="contained" onClick={() => setRegistrationSuccess(null)}>
                Tamam
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Kayıt Modal */}
        <Dialog open={registerModal.open} onClose={() => setRegisterModal({ open: false, customFields: {} })} maxWidth="sm" fullWidth>
          <DialogTitle>Etkinliğe Kayıt Ol</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {event.title} etkinliğine kayıt olmak istediğinize emin misiniz?
            </Typography>
            {event.is_paid && event.price > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Bu etkinlik ücretlidir: {event.price} ₺ (Cüzdanınızdan düşülecektir)
              </Alert>
            )}
            {/* Custom fields için form alanları eklenebilir */}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRegisterModal({ open: false, customFields: {} })}>
              İptal
            </Button>
            <Button variant="contained" onClick={handleRegister}>
              Kayıt Ol
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default EventDetail;

