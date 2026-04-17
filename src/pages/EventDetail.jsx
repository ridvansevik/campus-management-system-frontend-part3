import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container, Paper, Typography, Button, Box, Chip, Grid, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider, Alert,
  LinearProgress, Tooltip, CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventDetail, registerEvent, joinWaitlist, leaveWaitlist, getWaitlistPosition, acceptWaitlistSpot } from '../services/eventService';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { QRCodeSVG } from 'qrcode.react';

const EventDetail = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registerModal, setRegisterModal] = useState({ open: false, customFields: {} });
  const [registrationSuccess, setRegistrationSuccess] = useState(null);

  // Waitlist state
  const [waitlistPosition, setWaitlistPosition] = useState(null);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [acceptingSpot, setAcceptingSpot] = useState(false);

  useEffect(() => {
    fetchEventDetail();
  }, [id]);

  const fetchEventDetail = async () => {
    try {
      setLoading(true);
      const res = await getEventDetail(id);
      setEvent(res.data.data);

      // Check waitlist position
      try {
        const waitlistRes = await getWaitlistPosition(id);
        setWaitlistPosition(waitlistRes.data.data);
      } catch (e) {
        // Not on waitlist or error
        setWaitlistPosition(null);
      }
    } catch (error) {
      console.error(error);
      toast.error(t('events.load_error'));
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      const res = await registerEvent(id, registerModal.customFields);
      setRegisterModal({ open: false, customFields: {} });
      toast.success(t('events.register_success'));
      fetchEventDetail();
    } catch (error) {
      toast.error(error.response?.data?.error || t('events.register_failed'));
    }
  };

  const handleJoinWaitlist = async () => {
    try {
      setWaitlistLoading(true);
      const res = await joinWaitlist(id);
      toast.success(t('waitlist.join_success'));
      setWaitlistPosition(res.data.data);
      fetchEventDetail();
    } catch (error) {
      toast.error(error.response?.data?.error || t('waitlist.join_error'));
    } finally {
      setWaitlistLoading(false);
    }
  };

  const handleLeaveWaitlist = async () => {
    try {
      setWaitlistLoading(true);
      await leaveWaitlist(id);
      toast.success(t('waitlist.leave_success'));
      setWaitlistPosition(null);
      fetchEventDetail();
    } catch (error) {
      toast.error(error.response?.data?.error || t('waitlist.leave_error'));
    } finally {
      setWaitlistLoading(false);
    }
  };

  const handleAcceptSpot = async () => {
    try {
      setAcceptingSpot(true);
      const res = await acceptWaitlistSpot(id);
      toast.success(t('waitlist.accept_success'));
      setWaitlistPosition(null);
      setRegistrationSuccess(res.data.data);
      fetchEventDetail();
    } catch (error) {
      toast.error(error.response?.data?.error || t('waitlist.accept_error'));
    } finally {
      setAcceptingSpot(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Typography>{t('common.loading')}</Typography>
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
  const hasWaitlist = event.waitlist_count > 0;
  const isOnWaitlist = waitlistPosition !== null;
  const isNotified = waitlistPosition?.status === 'notified';
  const canJoinWaitlist = isFull && !isDeadlinePassed && !isOnWaitlist;

  // Calculate time remaining for notified users
  const getTimeRemaining = () => {
    if (!waitlistPosition?.expires_at) return null;
    const expires = new Date(waitlistPosition.expires_at);
    const now = new Date();
    const diffMs = expires - now;
    if (diffMs <= 0) return t('waitlist.expired');
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Layout>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/events')}
          sx={{ mb: 2 }}
        >
          {t('event_detail.back')}
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
                  <Typography variant="body2" color="text.secondary">{t('event_detail.date')}</Typography>
                  <Typography variant="body1">
                    {new Date(event.date).toLocaleDateString(i18n.language, {
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
                  <Typography variant="body2" color="text.secondary">{t('event_detail.time')}</Typography>
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
                  <Typography variant="body2" color="text.secondary">{t('event_detail.location')}</Typography>
                  <Typography variant="body1">{event.location}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <PeopleIcon color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">{t('event_detail.capacity')}</Typography>
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

            {/* Waitlist count */}
            {hasWaitlist && (
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <HourglassEmptyIcon color="warning" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">{t('waitlist.count_label')}</Typography>
                    <Typography variant="body1" color="warning.main" fontWeight="bold">
                      {event.waitlist_count} {t('waitlist.people_waiting')}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>

          {event.is_paid && event.price > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {t('event_detail.paid_alert')} <strong>{event.price} ₺</strong>
            </Alert>
          )}

          {event.registration_deadline && (
            <Alert
              severity={isDeadlinePassed ? 'error' : 'warning'}
              sx={{ mt: 2 }}
            >
              {t('event_detail.deadline_alert')} {new Date(event.registration_deadline).toLocaleDateString(i18n.language)}
              {isDeadlinePassed && ` ${t('event_detail.deadline_passed')}`}
            </Alert>
          )}

          {isFull && !isOnWaitlist && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {t('event_detail.full_alert')}
            </Alert>
          )}

          {/* Waitlist Status Card */}
          {isOnWaitlist && (
            <Card
              sx={{
                mt: 3,
                bgcolor: isNotified ? 'success.light' : 'warning.light',
                borderLeft: 4,
                borderColor: isNotified ? 'success.main' : 'warning.main'
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  {isNotified ? (
                    <NotificationsActiveIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  ) : (
                    <HourglassEmptyIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                  )}
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight="bold">
                      {isNotified ? t('waitlist.spot_available_title') : t('waitlist.on_waitlist_title')}
                    </Typography>
                    <Typography variant="body2">
                      {isNotified
                        ? t('waitlist.spot_available_desc')
                        : t('waitlist.position_desc', { position: waitlistPosition.position })}
                    </Typography>
                    {isNotified && waitlistPosition.expires_at && (
                      <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        ⏰ {t('waitlist.time_remaining')}: <strong>{getTimeRemaining()}</strong>
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  {isNotified ? (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={acceptingSpot ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                        onClick={handleAcceptSpot}
                        disabled={acceptingSpot}
                      >
                        {t('waitlist.accept_spot')}
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleLeaveWaitlist}
                        disabled={waitlistLoading}
                      >
                        {t('waitlist.decline_spot')}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={handleLeaveWaitlist}
                      disabled={waitlistLoading}
                    >
                      {waitlistLoading ? <CircularProgress size={20} /> : t('waitlist.leave_waitlist')}
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Box sx={{ mt: 3 }}>
            {canRegister && (
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => setRegisterModal({ open: true, customFields: {} })}
              >
                {t('event_detail.register_btn')}
              </Button>
            )}

            {canJoinWaitlist && (
              <Button
                variant="contained"
                color="warning"
                size="large"
                fullWidth
                startIcon={waitlistLoading ? <CircularProgress size={20} color="inherit" /> : <HourglassEmptyIcon />}
                onClick={handleJoinWaitlist}
                disabled={waitlistLoading}
              >
                {t('waitlist.join_waitlist')}
              </Button>
            )}

            {isDeadlinePassed && !isOnWaitlist && (
              <Button variant="contained" size="large" fullWidth disabled>
                {t('event_detail.expired_btn')}
              </Button>
            )}
          </Box>
        </Paper>

        {/* Registration Success Modal */}
        {registrationSuccess && (
          <Dialog open={!!registrationSuccess} onClose={() => setRegistrationSuccess(null)} maxWidth="sm" fullWidth>
            <DialogTitle>{t('event_detail.success_title')}</DialogTitle>
            <DialogContent>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                {registrationSuccess.qrCode && (
                  <>
                    <QRCodeSVG value={registrationSuccess.qr_code || registrationSuccess.qrCode} size={250} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {t('my_events.qr_desc')}
                    </Typography>
                  </>
                )}
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {t('event_detail.success_desc')}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setRegistrationSuccess(null);
                navigate('/my-events');
              }}>
                {t('event_detail.my_events_btn')}
              </Button>
              <Button variant="contained" onClick={() => setRegistrationSuccess(null)}>
                {t('common.close')}
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Registration Modal */}
        <Dialog open={registerModal.open} onClose={() => setRegisterModal({ open: false, customFields: {} })} maxWidth="sm" fullWidth>
          <DialogTitle>{t('event_detail.modal_title')}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {event.title} {t('event_detail.modal_desc')}
            </Typography>
            {event.is_paid && event.price > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {t('event_detail.paid_alert')} {event.price} ₺
              </Alert>
            )}

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('event_detail.extra_info')}
              </Typography>
              <TextField
                fullWidth
                label={t('event_detail.phone')}
                value={registerModal.customFields.phone || ''}
                onChange={(e) => setRegisterModal({
                  ...registerModal,
                  customFields: { ...registerModal.customFields, phone: e.target.value }
                })}
                sx={{ mb: 2 }}
                placeholder="5XX XXX XX XX"
              />
              <TextField
                fullWidth
                label={t('event_detail.notes')}
                value={registerModal.customFields.notes || ''}
                onChange={(e) => setRegisterModal({
                  ...registerModal,
                  customFields: { ...registerModal.customFields, notes: e.target.value }
                })}
                multiline
                rows={3}
                placeholder={t('event_detail.notes_placeholder')}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRegisterModal({ open: false, customFields: {} })}>
              {t('common.cancel')}
            </Button>
            <Button variant="contained" onClick={handleRegister}>
              {t('common.save')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default EventDetail;
