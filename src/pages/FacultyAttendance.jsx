import { useState, useEffect } from 'react';
import { 
  Typography, Paper, Grid, Box, Button, TextField, MenuItem, 
  CircularProgress, Alert, Card, CardContent 
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const FacultyAttendance = () => {
  const { user } = useAuth();
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
        toast.error("Ders listesi alınamadı.");
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
          toast.info("Bu ders için açık bir oturum bulundu.");
        } else {
          setActiveSession(null);
        }
      } catch (error) {
        console.error("Oturum kontrol hatası:", error);
      }
    };

    checkActiveSession();
  }, [selectedSection]);

  const handleStartSession = async () => {
    if (!selectedSection) {
      toast.warning("Lütfen bir ders şubesi seçin.");
      return;
    }

    // 1. Tarayıcı Konum Desteği Kontrolü
    if (!navigator.geolocation) {
      toast.error("Tarayıcınız konum servisini desteklemiyor.");
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
          toast.success("Konumunuz referans alınarak yoklama başlatıldı!");
        } catch (error) {
          toast.error(error.response?.data?.error || "Oturum başlatılamadı.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("GPS Hatası:", error);
        let msg = "Konum alınamadı.";
        if (error.code === 1) msg = "Lütfen tarayıcıdan konum izni verin.";
        else if (error.code === 2) msg = "Konum bulunamadı.";
        else if (error.code === 3) msg = "Konum zaman aşımı.";
        
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
      toast.info("Oturum kapatıldı.");
      setActiveSession(null);
      setSelectedSection(''); // Seçimi sıfırla
    } catch (error) {
      toast.error("Oturum kapatılırken hata oluştu.");
    }
  };

  if (loading) return <Layout><Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box></Layout>;

  // Rol kontrolü (Admin de girebilsin diye esnettik, yoksa sadece faculty)
  if (user?.role !== 'faculty' && user?.role !== 'admin') {
    return <Layout><Alert severity="error">Bu sayfaya yetkiniz yok.</Alert></Layout>;
  }

  return (
    <Layout>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#2c3e50' }}>
        Yoklama Başlat
      </Typography>

      <Grid container spacing={4}>
        {/* Sol Taraf: Ayarlar */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 0, borderTop: '4px solid #1976d2' }}>
            <Typography variant="h6" gutterBottom>Oturum Ayarları</Typography>
            
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                select
                label="Ders Şubesi Seçin"
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
                  <MenuItem disabled>Ders bulunamadı</MenuItem>
                )}
              </TextField>

              <TextField
                label="GPS Yarıçapı (Metre)"
                type="number"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                fullWidth
                disabled={!!activeSession}
                helperText="Öğrenciler hocanın konumuna ne kadar yakın olmalı?"
              />

              <TextField
                label="Süre (Dakika)"
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
                  Yoklamayı Başlat
                </Button>
              ) : (
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="large" 
                  onClick={handleCloseSession}
                  sx={{ borderRadius: 0 }}
                >
                  Oturumu Bitir
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
                  YOKLAMA AKTİF
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Öğrenciler QR kodu okutarak yoklama verebilirler.
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
                    Bitiş Saati: {activeSession.end_time?.slice(0, 5) || "Belirsiz"}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Merkez Konum: {activeSession.latitude?.toFixed(4)}, {activeSession.longitude?.toFixed(4)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Paper sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', bgcolor: '#f5f5f5' }}>
              <Typography>Aktif bir yoklama oturumu bulunmuyor.</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Layout>
  );
};

export default FacultyAttendance;