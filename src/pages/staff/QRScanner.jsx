import React, { useState } from 'react';
import { 
  Container, Paper, Typography, Box, Select, MenuItem, FormControl, InputLabel,
  Card, CardContent, Chip, CircularProgress, TextField, Button, Grid
} from '@mui/material';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useReservation } from '../../services/mealService';
import { checkInEvent } from '../../services/eventService';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const QRScanner = () => {
  const [scanMode, setScanMode] = useState('meal'); // 'meal' veya 'event'
  const [lastScanned, setLastScanned] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [manualQR, setManualQR] = useState('');

  const handleScan = async (detectedCodes) => {
    if (isProcessing) return;
    
    const rawValue = detectedCodes[0]?.rawValue;
    if (!rawValue || rawValue === lastScanned) return;

    setIsProcessing(true);
    setLastScanned(rawValue);
    setLastResult(null);

    try {
      // QR kod string'i direkt backend'e gönder (backend parse edecek)
      if (scanMode === 'meal') {
        // Backend'de ID veya QR kod ile çalışıyor
        // QR kod token'ı direkt gönder
        const res = await useReservation('use', rawValue); // ID='use', QR kod body'de
        toast.success('Yemek kullanımı başarılı! ✅');
        setLastResult({ type: 'meal', success: true, data: res.data.data });
      } 
      else if (scanMode === 'event') {
        // Event QR kod formatı: { u: userId, e: eventId, r: token, type: 'event' }
        // Backend QR kod parse edecek, eventId ve registrationId gerekmez
        const res = await checkInEvent(null, null, rawValue);
        toast.success('Etkinlik girişi başarılı! ✅');
        setLastResult({ type: 'event', success: true, data: res.data.data });
      }

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Geçersiz QR veya İşlem Hatası');
      setLastResult({ type: scanMode, success: false, error: error.response?.data?.error });
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setLastScanned(null);
      }, 3000);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualQR.trim()) {
      toast.error('QR kod giriniz');
      return;
    }
    await handleScan([{ rawValue: manualQR.trim() }]);
  };

  return (
    <Layout>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          QR Kod Tarayıcı
        </Typography>

        <Grid container spacing={3}>
          {/* Scanner */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Tarama Modu</InputLabel>
                <Select
                  value={scanMode}
                  label="Tarama Modu"
                  onChange={(e) => {
                    setScanMode(e.target.value);
                    setLastResult(null);
                    setLastScanned(null);
                  }}
                >
                  <MenuItem value="meal">
                    <Box display="flex" alignItems="center" gap={1}>
                      <RestaurantIcon /> Yemekhane
                    </Box>
                  </MenuItem>
                  <MenuItem value="event">
                    <Box display="flex" alignItems="center" gap={1}>
                      <EventIcon /> Etkinlik Girişi
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {isProcessing && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 1 }}>İşleniyor...</Typography>
                </Box>
              )}

              <Box sx={{ 
                height: 400, 
                overflow: 'hidden', 
                borderRadius: 2, 
                border: '2px solid',
                borderColor: 'primary.main',
                position: 'relative',
                bgcolor: 'black'
              }}>
                <Scanner 
                  onScan={handleScan} 
                  allowMultiple={false}
                  scanDelay={1000}
                  styles={{ container: { width: '100%', height: '100%' } }}
                />
              </Box>

              <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'center' }}>
                Kameraya QR kodu gösteriniz veya manuel olarak giriniz.
              </Typography>

              {/* Manuel QR Girişi */}
              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="QR Kod (Manuel Giriş)"
                  value={manualQR}
                  onChange={(e) => setManualQR(e.target.value)}
                  placeholder="QR kod string'ini buraya yapıştırın"
                  size="small"
                />
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ mt: 1 }}
                  onClick={handleManualSubmit}
                  disabled={isProcessing || !manualQR.trim()}
                >
                  Manuel Doğrula
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Sonuç Paneli */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Son İşlem
              </Typography>
              
              {lastResult ? (
                <Card sx={{ mt: 2, bgcolor: lastResult.success ? 'success.light' : 'error.light' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      {lastResult.success ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <Typography color="error">❌</Typography>
                      )}
                      <Typography variant="subtitle2">
                        {lastResult.success ? 'Başarılı' : 'Hata'}
                      </Typography>
                    </Box>
                    
                    {lastResult.success && lastResult.data && (
                      <Box sx={{ mt: 2 }}>
                        {lastResult.type === 'meal' && lastResult.data.user && (
                          <>
                            <Typography variant="body2">
                              <strong>Kullanıcı:</strong> {lastResult.data.user.name}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Öğün:</strong> {lastResult.data.mealType === 'lunch' ? 'Öğle' : 'Akşam'}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Tarih:</strong> {lastResult.data.date}
                            </Typography>
                          </>
                        )}
                        {lastResult.type === 'event' && lastResult.data.user && (
                          <>
                            <Typography variant="body2">
                              <strong>Kullanıcı:</strong> {lastResult.data.user.name}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Giriş:</strong> {new Date(lastResult.data.checkedInAt).toLocaleString('tr-TR')}
                            </Typography>
                          </>
                        )}
                      </Box>
                    )}
                    
                    {!lastResult.success && (
                      <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        {lastResult.error || 'Bilinmeyen hata'}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    QR kod tarandığında sonuç burada görünecek.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default QRScanner;