import { useState } from 'react';
import { 
  Typography, Paper, Box, Button, CircularProgress, Alert, TextField, 
  Container 
} from '@mui/material';
import { Scanner } from '@yudiel/react-qr-scanner'; // Yeni kütüphane
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-toastify';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const StudentAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [manualId, setManualId] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isScanning, setIsScanning] = useState(true); // Tarama durumunu kontrol et

  // QR Okunduğunda çalışır
  const handleScan = (text) => {
    if (text) {
      try {
        // QR kodun içindeki JSON verisini çözümle
        // Format: { sessionId: 1, code: "xyz..." }
        const parsedData = JSON.parse(text);
        
        // Tarayıcıyı durdur ve işleme başla
        setIsScanning(false); 
        toast.info("QR Kod algılandı, konum alınıyor...");
        
        // Yoklama işlemine başla
        submitAttendance(parsedData.sessionId);
      } catch (error) {
        console.error("QR Parse Hatası:", error);
        // Hatalı format olsa bile kullanıcıyı baymamak için toast göstermiyoruz,
        // sadece konsola yazıyoruz. Doğru QR gelene kadar taramaya devam eder.
      }
    }
  };

  const handleError = (err) => {
    console.error("Kamera Hatası:", err);
    setStatusMessage("Kameraya erişilemedi. Lütfen izinleri kontrol edin.");
  };

  // Manuel ID ile gönderim
  const handleManualSubmit = () => {
    if (!manualId) return;
    setIsScanning(false); // Manuel gönderimde kamerayı durdurabiliriz
    submitAttendance(manualId);
  };

  const submitAttendance = (sessionId) => {
    setLoading(true);
    setStatusMessage("Konum alınıyor (Lütfen bekleyin)...");

    if (!navigator.geolocation) {
      setStatusMessage("Tarayıcınız konum servisini desteklemiyor.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setStatusMessage("Konum alındı. Sunucuya gönderiliyor...");

        try {
          const res = await api.post(`/attendance/sessions/${sessionId}/checkin`, {
            latitude,
            longitude
          });

          setStatusMessage("");
          toast.success(res.data.message);
          // Başarılı olduktan sonra tekrar taramaya gerek yok
        } catch (error) {
          const errMsg = error.response?.data?.error || "Yoklama işlemi başarısız.";
          setStatusMessage(errMsg);
          toast.error(errMsg);
          
          // Hata durumunda tekrar taramaya izin ver
          setTimeout(() => setIsScanning(true), 2000);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("GPS Hatası:", error);
        let msg = "Konum alınamadı.";
        if (error.code === 1) msg = "Lütfen tarayıcıdan konum izni verin.";
        else if (error.code === 2) msg = "Konum bulunamadı. GPS sinyali zayıf.";
        else if (error.code === 3) msg = "Konum alma süresi doldu. Lütfen tekrar deneyin.";
        
        setStatusMessage(msg);
        toast.error(msg);
        setLoading(false);
        // Konum hatasında tekrar taramaya izin ver
        setIsScanning(true);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 20000, // 20 Saniye bekle (Artırıldı)
        maximumAge: 0 
      }
    );
  };

  return (
    <Layout>
      <Container maxWidth="sm">
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center' }}>
          Yoklama Ver
        </Typography>

        <Paper sx={{ p: 3, borderRadius: 2, overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h6" color="text.secondary" align="center">{statusMessage}</Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', color: '#1976d2' }}>
                <LocationOnIcon sx={{ mr: 1 }} /> Konum servisleri çalışıyor
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
                Lütfen öğretim üyesinin ekranındaki QR kodu okutun.
              </Typography>
              
              {/* QR Scanner Alanı */}
              <Box sx={{ 
                mx: 'auto', 
                maxWidth: 350, 
                border: '1px solid #ddd', 
                borderRadius: 2, 
                overflow: 'hidden',
                mb: 3 
              }}>
                {isScanning && (
                  <Scanner
                    onScan={(result) => {
                      if (result && result.length > 0) {
                        handleScan(result[0].rawValue);
                      }
                    }}
                    onError={handleError}
                    components={{
                      audio: false, // Bip sesini kapat
                      finder: true  // Tarama çerçevesini göster
                    }}
                    styles={{
                      container: { width: '100%' }
                    }}
                  />
                )}
                {!isScanning && (
                  <Box sx={{ p: 4, bgcolor: '#f5f5f5' }}>
                    <Typography>İşlem yapılıyor...</Typography>
                    <Button onClick={() => setIsScanning(true)} sx={{ mt: 2 }} variant="outlined">
                      Tekrar Tara
                    </Button>
                  </Box>
                )}
              </Box>

              {statusMessage && <Alert severity="error" sx={{ mb: 2 }}>{statusMessage}</Alert>}

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                veya manuel kod girin
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <TextField 
                  label="Oturum ID" 
                  size="small" 
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder="ID giriniz..."
                />
                <Button variant="contained" onClick={handleManualSubmit} disabled={!manualId}>
                  Gönder
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </Layout>
  );
};

export default StudentAttendance;