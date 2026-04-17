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
import { useTranslation } from 'react-i18next';

const QRScanner = () => {
  const { t } = useTranslation();
  const [scanMode, setScanMode] = useState('meal'); // 'meal' veya 'event'
  const [lastScanned, setLastScanned] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [manualQR, setManualQR] = useState('');

  const handleScan = async (detectedCodes) => {
    if (isProcessing) return;

    const rawValue = detectedCodes[0]?.rawValue;
    if (!rawValue || rawValue === lastScanned) return;

    // YENİ: Otomatik Tür Kontrolü
    try {
      const parsedData = JSON.parse(rawValue);
      // Eğer taranan kodun tipi ile seçili mod uyuşmuyorsa uyarı ver
      if (parsedData.type && parsedData.type !== scanMode) {
        const correctMode = parsedData.type === 'event' ? t('qr_scanner.event') : t('qr_scanner.cafeteria');
        toast.warning(t('qr_scanner.wrong_mode', { mode: correctMode }));
        return; // İşlemi durdur
      }
    } catch (e) {
      // JSON değilse (eski format veya düz token) devam et
    }

    try {
      // QR kod string'i direkt backend'e gönder (backend parse edecek)
      if (scanMode === 'meal') {
        // Backend'de ID veya QR kod ile çalışıyor
        // QR kod token'ı direkt gönder
        const res = await useReservation('use', rawValue); // ID='use', QR kod body'de
        toast.success(t('qr_scanner.meal_success'));
        setLastResult({ type: 'meal', success: true, data: res.data.data });
      }
      else if (scanMode === 'event') {
        // Event QR kod formatı: { u: userId, e: eventId, r: token, type: 'event' }
        // Backend QR kod parse edecek, eventId ve registrationId gerekmez
        const res = await checkInEvent(null, null, rawValue);
        toast.success(t('qr_scanner.event_success'));
        setLastResult({ type: 'event', success: true, data: res.data.data });
      }

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || t('qr_scanner.invalid_qr'));
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
      toast.error(t('qr_scanner.enter_qr'));
      return;
    }
    await handleScan([{ rawValue: manualQR.trim() }]);
  };

  return (
    <Layout>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          {t('qr_scanner.title')}
        </Typography>

        <Grid container spacing={3}>
          {/* Scanner */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>{t('qr_scanner.scan_mode')}</InputLabel>
                <Select
                  value={scanMode}
                  label={t('qr_scanner.scan_mode')}
                  onChange={(e) => {
                    setScanMode(e.target.value);
                    setLastResult(null);
                    setLastScanned(null);
                  }}
                >
                  <MenuItem value="meal">
                    <Box display="flex" alignItems="center" gap={1}>
                      <RestaurantIcon /> {t('qr_scanner.meal_mode')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="event">
                    <Box display="flex" alignItems="center" gap={1}>
                      <EventIcon /> {t('qr_scanner.event_mode')}
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {isProcessing && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 1 }}>{t('qr_scanner.processing')}</Typography>
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
                {t('qr_scanner.instruction')}
              </Typography>

              {/* Manuel QR Girişi */}
              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label={t('qr_scanner.manual_label')}
                  value={manualQR}
                  onChange={(e) => setManualQR(e.target.value)}
                  placeholder={t('qr_scanner.manual_placeholder')}
                  size="small"
                />
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 1 }}
                  onClick={handleManualSubmit}
                  disabled={isProcessing || !manualQR.trim()}
                >
                  {t('qr_scanner.manual_verify_btn')}
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Sonuç Paneli */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                {t('qr_scanner.last_result')}
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
                        {lastResult.success ? t('qr_scanner.success') : t('qr_scanner.error')}
                      </Typography>
                    </Box>

                    {lastResult.success && lastResult.data && (
                      <Box sx={{ mt: 2 }}>
                        {lastResult.type === 'meal' && lastResult.data.user && (
                          <>
                            <Typography variant="body2">
                              <strong>{t('qr_scanner.user')}:</strong> {lastResult.data.user.name}
                            </Typography>
                            <Typography variant="body2">
                              <strong>{t('qr_scanner.meal')}:</strong> {lastResult.data.mealType === 'lunch' ? t('qr_scanner.noon') : t('qr_scanner.evening')}
                            </Typography>
                            <Typography variant="body2">
                              <strong>{t('qr_scanner.date')}:</strong> {lastResult.data.date}
                            </Typography>
                          </>
                        )}
                        {lastResult.type === 'event' && lastResult.data.user && (
                          <>
                            <Typography variant="body2">
                              <strong>{t('qr_scanner.user')}:</strong> {lastResult.data.user.name}
                            </Typography>
                            <Typography variant="body2">
                              <strong>{t('qr_scanner.check_in')}:</strong> {new Date(lastResult.data.checkedInAt).toLocaleString(t('i18n.language'))}
                            </Typography>
                          </>
                        )}
                      </Box>
                    )}

                    {!lastResult.success && (
                      <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        {lastResult.error || t('qr_scanner.unknown_error')}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('qr_scanner.no_result')}
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