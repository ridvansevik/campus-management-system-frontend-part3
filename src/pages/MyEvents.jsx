import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
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
    if (!window.confirm(t('my_events.cancel_confirm'))) return;
    try {
      await cancelEventRegistration(id);
      toast.success(t('my_events.cancel_success'));
      loadMyEvents();
    } catch (error) {
      toast.error(error.response?.data?.error || t('my_events.cancel_fail'));
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
          {t('my_events.title')}
        </Typography>

        {registrations.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {t('my_events.no_regs')}
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate('/events')}
            >
              {t('my_events.view_events')}
            </Button>
          </Paper>
        ) : (
          <>
            {/* Yaklaşan Etkinlikler */}
            {upcoming.length > 0 && (
              <Box mb={4}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  {t('my_events.upcoming')}
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
                              label={reg.checked_in ? t('my_events.status.checked_in') : t('my_events.status.pending')}
                              color={reg.checked_in ? 'success' : 'primary'}
                              size="small"
                              icon={reg.checked_in ? <CheckCircleIcon /> : <EventIcon />}
                            />
                          </Box>

                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <EventIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {new Date(reg.Event?.date).toLocaleDateString(i18n.language)} | {reg.Event?.start_time}
                            </Typography>
                          </Box>

                          <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <Typography variant="body2" color="text.secondary">
                              {reg.Event?.location}
                            </Typography>
                          </Box>

                          {reg.checked_in && reg.checked_in_at && (
                            <Typography variant="caption" color="success.main" display="block" sx={{ mb: 2 }}>
                              {t('my_events.check_in_time')}: {new Date(reg.checked_in_at).toLocaleString(i18n.language)}
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
                                  {t('my_events.show_qr')}
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
                                {t('my_events.cancel')}
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
                  {t('my_events.past')}
                </Typography>
                <Grid container spacing={3}>
                  {past.map((reg) => (
                    <Grid item xs={12} md={6} key={reg.id}>
                      <Card elevation={1} sx={{ opacity: 0.7 }}>
                        <CardContent>
                          <Typography variant="h6">{reg.Event?.title}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {new Date(reg.Event?.date).toLocaleDateString(i18n.language)}
                          </Typography>
                          <Chip
                            label={reg.checked_in ? t('my_events.status.attended') : t('my_events.status.missed')}
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
          <DialogTitle>{t('my_events.qr_title')}</DialogTitle>
          <DialogContent sx={{ textAlign: 'center', py: 3 }}>
            {selectedQR && (
              <Box>
                <QRCodeSVG value={selectedQR} size={300} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {t('my_events.qr_desc')}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedQR(null)}>{t('common.close')}</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default MyEvents;