import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Card, CardContent, Typography, Button, Box, Dialog,
  DialogTitle, DialogContent, DialogActions, Chip, Paper, Divider
} from '@mui/material';
import { getMyEvents, cancelEventRegistration } from '../services/eventService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { QRCodeSVG } from 'qrcode.react';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const MyEvents = () => {
  const [registrations, setRegistrations] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadMyEvents();
  }, []);

  const loadMyEvents = async () => {
    try {
      const res = await getMyEvents();
      setRegistrations(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Etkinlikler yüklenemedi');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Kaydı iptal etmek istediğinize emin misiniz?')) return;
    try {
      await cancelEventRegistration(id);
      toast.success('Kayıt iptal edildi');
      loadMyEvents();
    } catch (error) {
      toast.error(error.response?.data?.error || 'İptal işlemi başarısız');
    }
  };

  // Gelecek ve geçmiş etkinlikleri ayır
  const today = new Date().toISOString().split('T')[0];
  const upcoming = registrations.filter(r => r.Event?.date >= today);
  const past = registrations.filter(r => r.Event?.date < today);

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          Kayıtlı Etkinliklerim
        </Typography>

        {registrations.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Henüz bir etkinliğe kayıt olmadınız.
            </Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              onClick={() => navigate('/events')}
            >
              Etkinlikleri Görüntüle
            </Button>
          </Paper>
        ) : (
          <>
            {/* Yaklaşan Etkinlikler */}
            {upcoming.length > 0 && (
              <Box mb={4}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Yaklaşan Etkinlikler
                </Typography>
                <Grid container spacing={3}>
                  {upcoming.map((reg) => (
                    <Grid item xs={12} md={6} key={reg.id}>
                      <Card elevation={2} sx={{ height: '100%' }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Typography 
                              variant="h6" 
                              sx={{ flex: 1, cursor: 'pointer' }}
                              onClick={() => navigate(`/events/${reg.Event?.id}`)}
                            >
                              {reg.Event?.title}
                            </Typography>
                            <Chip 
                              label={reg.checked_in ? 'Giriş Yapıldı' : 'Bekleniyor'}
                              color={reg.checked_in ? 'success' : 'primary'}
                              size="small"
                              icon={reg.checked_in ? <CheckCircleIcon /> : <EventIcon />}
                            />
                          </Box>

                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <EventIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {new Date(reg.Event?.date).toLocaleDateString('tr-TR')} | {reg.Event?.start_time}
                            </Typography>
                          </Box>

                          <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <Typography variant="body2" color="text.secondary">
                              {reg.Event?.location}
                            </Typography>
                          </Box>

                          {reg.checked_in && reg.checked_in_at && (
                            <Typography variant="caption" color="success.main" display="block" sx={{ mb: 2 }}>
                              Giriş: {new Date(reg.checked_in_at).toLocaleString('tr-TR')}
                            </Typography>
                          )}

                          <Divider sx={{ my: 2 }} />

                          <Box display="flex" gap={2} alignItems="center">
                            {reg.qr_code && (
                              <Box 
                                sx={{ 
                                  cursor: 'pointer', 
                                  border: '2px dashed',
                                  borderColor: 'primary.main',
                                  borderRadius: 2,
                                  p: 2,
                                  textAlign: 'center',
                                  flex: 1,
                                  '&:hover': { bgcolor: 'action.hover' }
                                }}
                                onClick={() => setSelectedQR(reg.qr_code)}
                              >
                                <QRCodeSVG value={reg.qr_code} size={120} />
                                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                  QR Kodu Göster
                                </Typography>
                              </Box>
                            )}
                            
                            {!reg.checked_in && (
                              <Button 
                                color="error" 
                                variant="outlined"
                                size="small"
                                onClick={() => handleCancel(reg.id)}
                                startIcon={<CancelIcon />}
                              >
                                İptal
                              </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Geçmiş Etkinlikler */}
            {past.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Geçmiş Etkinlikler
                </Typography>
                <Grid container spacing={3}>
                  {past.map((reg) => (
                    <Grid item xs={12} md={6} key={reg.id}>
                      <Card elevation={1} sx={{ opacity: 0.7 }}>
                        <CardContent>
                          <Typography variant="h6">{reg.Event?.title}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {new Date(reg.Event?.date).toLocaleDateString('tr-TR')}
                          </Typography>
                          <Chip 
                            label={reg.checked_in ? 'Katıldı' : 'Katılmadı'}
                            color={reg.checked_in ? 'success' : 'default'}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </>
        )}

        {/* QR Code Full Screen Dialog */}
        <Dialog 
          open={!!selectedQR} 
          onClose={() => setSelectedQR(null)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Giriş QR Kodunuz</DialogTitle>
          <DialogContent sx={{ textAlign: 'center', py: 3 }}>
            {selectedQR && (
              <Box>
                <QRCodeSVG value={selectedQR} size={300} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Etkinlik girişinde görevliye bu QR kodu gösteriniz.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedQR(null)}>Kapat</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default MyEvents;