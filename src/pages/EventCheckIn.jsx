import React, { useState } from 'react';
import {
  Container, Paper, Typography, Box, Card, CardContent, Chip,
  Grid, Alert, TextField, Button
} from '@mui/material';
import { Scanner } from '@yudiel/react-qr-scanner';
import { checkInEvent } from '../services/eventService';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';

const EventCheckIn = () => {
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
      // QR kod formatı: JSON string veya token
      // Backend QR kod parse edecek, eventId ve registrationId gerekmez
      const res = await checkInEvent(null, null, rawValue);
      toast.success('Check-in başarılı! ✅');
      setLastResult({ 
        success: true, 
        data: res.data.data,
        timestamp: new Date().toLocaleString('tr-TR')
      });

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Check-in başarısız');
      setLastResult({ 
        success: false, 
        error: error.response?.data?.error || 'Bilinmeyen hata',
        timestamp: new Date().toLocaleString('tr-TR')
      });
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
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <EventIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Etkinlik Check-In
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Etkinlik katılımcılarının QR kodlarını tarayarak giriş yapmalarını sağlayın.
        </Alert>

        <Grid container spacing={3}>
          {/* Scanner */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              {isProcessing && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  İşleniyor...
                </Alert>
              )}

              <Box sx={{ 
                height: 400, 
                overflow: 'hidden', 
                borderRadius: 2, 
                border: '2px solid',
                borderColor: 'primary.main',
                position: 'relative',
                bgcolor: 'black',
                mb: 2
              }}>
                <Scanner 
                  onScan={handleScan} 
                  allowMultiple={false}
                  scanDelay={1000}
                  styles={{ container: { width: '100%', height: '100%' } }}
                />
              </Box>

              <Typography variant="caption" display="block" sx={{ mb: 2, textAlign: 'center' }}>
                Kameraya QR kodu gösteriniz veya manuel olarak giriniz.
              </Typography>

              {/* Manuel QR Girişi */}
              <TextField
                fullWidth
                label="QR Kod (Manuel Giriş)"
                value={manualQR}
                onChange={(e) => setManualQR(e.target.value)}
                placeholder="QR kod string'ini buraya yapıştırın"
                size="small"
                sx={{ mb: 1 }}
              />
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={handleManualSubmit}
                disabled={isProcessing || !manualQR.trim()}
              >
                Manuel Doğrula
              </Button>
            </Paper>
          </Grid>

          {/* Sonuç Paneli */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Son Check-In
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
                        {lastResult.data.user && (
                          <>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <PersonIcon fontSize="small" />
                              <Typography variant="body2" fontWeight="bold">
                                {lastResult.data.user.name}
                              </Typography>
                            </Box>
                            {lastResult.data.user.email && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                {lastResult.data.user.email}
                              </Typography>
                            )}
                          </>
                        )}
                        {lastResult.timestamp && (
                          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                            {lastResult.timestamp}
                          </Typography>
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

export default EventCheckIn;

