import { useState, useEffect } from 'react';
import {
  Typography, Paper, Grid, Box, Button, TextField, MenuItem,
  CircularProgress, Alert, Card, CardContent
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const FacultyAttendance = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);

  // Form State
  const [selectedSection, setSelectedSection] = useState('');
  const [radius, setRadius] = useState(15);
  const [duration, setDuration] = useState(30);

  // 1. Hocanın Şubelerini Getir
  useEffect(() => {
    // Eğer kullanıcı bilgisi henüz yüklenmediyse bekle
    if (!user) return;

    const fetchMySections = async () => {
      try {
        setLoading(true); // Yükleniyor...
        const res = await api.get('/sections');

        // Hoca ise sadece kendi dersleri, Admin ise hepsi
        let mySections = res.data.data;

        if (user.role === 'faculty' && user.facultyProfile) {
          mySections = mySections.filter(
            sec => sec.instructorId === user.facultyProfile.id
          );
        }

        setSections(mySections);
      } catch (error) {
        console.error("Şubeler yüklenemedi", error);
        toast.error(t('faculty_attendance.load_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchMySections();
  }, [user]); // user değiştiğinde (sayfa ilk açıldığında veya F5'te) çalışır

  // 2. Şube seçilince aktif oturum kontrolü
  useEffect(() => {
    const checkActiveSession = async () => {
      if (!selectedSection) return;

      try {
        const res = await api.get(`/attendance/report/${selectedSection}`);
        const sessions = res.data.data;
        const active = sessions.find(s => s.status === 'active');

        if (active) {
          setActiveSession(active);
          setRadius(active.geofence_radius);
          toast.info(t('faculty_attendance.session_found'));
        } else {
          setActiveSession(null);
        }
      } catch (error) {
        console.error("Oturum kontrol hatası:", error);
      }
    };

    checkActiveSession();
  }, [selectedSection]);

  // 3. QR Kodunu Her 5 Saniyede Bir Yenile
  useEffect(() => {
    let interval;
    if (activeSession && activeSession.status === 'active') {
      interval = setInterval(async () => {
        try {
          const res = await api.put(`/attendance/sessions/${activeSession.id}/refresh-qr`);
          const newCode = res.data.data.qr_code;

          setActiveSession(prev => ({ ...prev, qr_code: newCode }));
        } catch (error) {
          console.error("QR yenileme hatası:", error);
          // Hata olsa da devam etsin, belki internet gitti geldi
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [activeSession?.id, activeSession?.status]);

  const handleStartSession = async () => {
    if (!selectedSection) {
      toast.warning(t('faculty_attendance.select_section_warning'));
      return;
    }

    // 1. Tarayıcı Konum Desteği Kontrolü
    if (!navigator.geolocation) {
      toast.error(t('faculty_attendance.geolocation_error'));
      return;
    }

    setLoading(true);

    // 2. Konumu Al ve İsteği Gönder (BURASI KRİTİK)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await api.post('/attendance/sessions', {
            sectionId: selectedSection,
            geofence_radius: radius,
            duration_minutes: duration,
            latitude,  // Koordinatları backend'e gönderiyoruz
            longitude
          });

          setActiveSession(res.data.data);
          toast.success(t('faculty_attendance.success_start'));
        } catch (error) {
          toast.error(error.response?.data?.error || t('faculty_attendance.error_start'));
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("GPS Hatası:", error);
        let msg = t('faculty_attendance.gps_error');
        if (error.code === 1) msg = t('faculty_attendance.gps_permission');
        else if (error.code === 2) msg = t('faculty_attendance.gps_not_found');
        else if (error.code === 3) msg = t('faculty_attendance.gps_timeout');

        toast.error(msg);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleCloseSession = async () => {
    if (!activeSession) return;
    try {
      await api.put(`/attendance/sessions/${activeSession.id}/close`);
      toast.info(t('faculty_attendance.session_closed'));
      setActiveSession(null);
      setSelectedSection(''); // Seçimi sıfırla
    } catch (error) {
      toast.error(t('faculty_attendance.close_error'));
    }
  };

  if (loading) return <Layout><Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box></Layout>;

  // Rol kontrolü (Admin de girebilsin diye esnettik, yoksa sadece faculty)
  if (user?.role !== 'faculty' && user?.role !== 'admin') {
    return <Layout><Alert severity="error">{t('faculty_attendance.unauthorized')}</Alert></Layout>;
  }

  return (
    <Layout>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#2c3e50' }}>
        {t('faculty_attendance.title')}
      </Typography>

      <Grid container spacing={4}>
        {/* Sol Taraf: Ayarlar */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 0, borderTop: '4px solid #1976d2' }}>
            <Typography variant="h6" gutterBottom>{t('faculty_attendance.settings_title')}</Typography>

            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                select
                label={t('faculty_attendance.select_section')}
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                fullWidth
                disabled={!!activeSession}
              >
                {sections.length > 0 ? (
                  sections.map((sec) => (
                    <MenuItem key={sec.id} value={sec.id}>
                      {sec.course?.code} - {sec.course?.name} (Section {sec.section_number})
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>{t('faculty_attendance.no_section')}</MenuItem>
                )}
              </TextField>

              <TextField
                label={t('faculty_attendance.radius_label')}
                type="number"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                fullWidth
                disabled={!!activeSession}
                helperText={t('faculty_attendance.radius_helper')}
              />

              <TextField
                label={t('faculty_attendance.duration_label')}
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                fullWidth
                disabled={!!activeSession}
              />

              {!activeSession ? (
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleStartSession}
                  disabled={!selectedSection}
                  disableElevation
                  sx={{ borderRadius: 0 }}
                >
                  {t('faculty_attendance.start_btn')}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="error"
                  size="large"
                  onClick={handleCloseSession}
                  sx={{ borderRadius: 0 }}
                >
                  {t('faculty_attendance.close_btn')}
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Sağ Taraf: Canlı Durum ve QR */}
        <Grid item xs={12} md={6}>
          {activeSession ? (
            <Card sx={{ textAlign: 'center', p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Typography variant="h5" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {t('faculty_attendance.active_title')}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {t('faculty_attendance.active_desc')}
                </Typography>

                <Box sx={{ p: 2, bgcolor: 'white', display: 'inline-block', borderRadius: 2 }}>
                  <QRCodeSVG
                    value={JSON.stringify({
                      sessionId: activeSession.id,
                      code: activeSession.qr_code
                    })}
                    size={200}
                  />
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('faculty_attendance.end_time')}: {activeSession.end_time?.slice(0, 5) || "Belirsiz"}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {t('faculty_attendance.center_loc')}: {activeSession.latitude?.toFixed(4)}, {activeSession.longitude?.toFixed(4)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Paper sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', bgcolor: '#f5f5f5' }}>
              <Typography>{t('faculty_attendance.no_active')}</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Layout>
  );
};

export default FacultyAttendance;