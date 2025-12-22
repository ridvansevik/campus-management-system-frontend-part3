import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Card, CardContent, Typography, Button, Box, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Paper
} from '@mui/material';
import { getMyReservations, cancelReservation } from '../services/mealService';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const res = await getMyReservations();
      console.log('Rezervasyonlar:', res.data); // Debug için
      setReservations(res.data.data || []);
    } catch (error) {
      console.error('Rezervasyon yükleme hatası:', error);
      toast.error(error.response?.data?.error || 'Rezervasyonlar yüklenemedi');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if(!window.confirm('Rezervasyonu iptal etmek istediğinize emin misiniz? (Yemek saatinden en az 2 saat önce iptal edilmelidir)')) return;
    try {
      setLoading(true);
      await cancelReservation(id);
      toast.success('Rezervasyon iptal edildi');
      loadReservations();
    } catch (error) {
      toast.error(error.response?.data?.error || 'İptal edilemedi');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'reserved': return 'primary';
      case 'used': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'reserved': return 'Rezerve Edildi';
      case 'used': return 'Kullanıldı';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  // Rezervasyonları tarihe göre sırala (yakın tarih önce)
  const sortedReservations = [...reservations].sort((a, b) => {
    const dateA = new Date(a.reservation_date || a.MealMenu?.date || a.date);
    const dateB = new Date(b.reservation_date || b.MealMenu?.date || b.date);
    return dateB - dateA;
  });

  // Gelecek ve geçmiş rezervasyonları ayır
  const today = new Date().toISOString().split('T')[0];
  const upcoming = sortedReservations.filter(r => {
    const resDate = r.reservation_date || r.MealMenu?.date || r.date;
    return resDate && resDate >= today;
  });
  const past = sortedReservations.filter(r => {
    const resDate = r.reservation_date || r.MealMenu?.date || r.date;
    return resDate && resDate < today;
  });

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Yemek Rezervasyonlarım
        </Typography>

        {/* Gelecek Rezervasyonlar */}
        {upcoming.length > 0 && (
          <Box mb={4}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Yaklaşan Rezervasyonlar
            </Typography>
            <Grid container spacing={3}>
              {upcoming.map((res) => (
                <Grid item xs={12} sm={6} md={4} key={res.id}>
                  <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>
                        {res.reservation_date || res.MealMenu?.date || res.date || 'Tarih yok'}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        {res.meal_type === 'lunch' ? 'Öğle Yemeği' : 'Akşam Yemeği'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {res.MealMenu?.Cafeteria?.name || 'Yemekhane'}
                      </Typography>
                      
                      <Chip 
                        label={getStatusLabel(res.status)} 
                        color={getStatusColor(res.status)} 
                        sx={{ mb: 2, mt: 1 }}
                        icon={res.status === 'used' ? <CheckCircleIcon /> : res.status === 'cancelled' ? <CancelIcon /> : <AccessTimeIcon />}
                      />
                      
                      {res.status === 'reserved' && res.qr_code && (
                        <Box 
                          sx={{ 
                            cursor: 'pointer', 
                            p: 2, 
                            border: '2px dashed', 
                            borderColor: 'primary.main',
                            borderRadius: 2,
                            mb: 2,
                            '&:hover': { bgcolor: 'action.hover' }
                          }} 
                          onClick={() => setSelectedQR(res.qr_code)}
                        >
                          {/* QR kod: Backend'den gelen qrCode (base64 image) varsa onu kullan, yoksa token'dan JSON oluştur */}
                          {res.qrCode ? (
                            <img src={res.qrCode} alt="QR Code" style={{ width: '150px', height: '150px' }} />
                          ) : (
                            <QRCodeSVG 
                              value={JSON.stringify({ 
                                u: res.user_id, 
                                m: res.menu_id, 
                                r: res.qr_code, 
                                type: 'meal' 
                              })} 
                              size={150} 
                            />
                          )}
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            Büyütmek için tıkla
                          </Typography>
                        </Box>
                      )}

                      {res.status === 'reserved' && (
                        <Button 
                          color="error" 
                          variant="outlined"
                          size="small"
                          onClick={() => handleCancel(res.id)} 
                          sx={{ mt: 1 }}
                          disabled={loading}
                          fullWidth
                        >
                          İptal Et
                        </Button>
                      )}

                      {res.status === 'used' && res.used_at && (
                        <Typography variant="caption" color="success.main" display="block" sx={{ mt: 1 }}>
                          Kullanıldı: {new Date(res.used_at).toLocaleString('tr-TR')}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Geçmiş Rezervasyonlar */}
        {past.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Geçmiş Rezervasyonlar
            </Typography>
            <Grid container spacing={3}>
              {past.map((res) => (
                <Grid item xs={12} sm={6} md={4} key={res.id}>
                  <Card elevation={1} sx={{ opacity: 0.7 }}>
                    <CardContent>
                      <Typography variant="body1">{res.reservation_date || res.MealMenu?.date}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {res.meal_type === 'lunch' ? 'Öğle' : 'Akşam'}
                      </Typography>
                      <Chip 
                        label={getStatusLabel(res.status)} 
                        color={getStatusColor(res.status)} 
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

        {loading && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography>Yükleniyor...</Typography>
          </Paper>
        )}

        {!loading && reservations.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Henüz rezervasyonunuz yok.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Yemek menüsünden rezervasyon yapabilirsiniz.
            </Typography>
          </Paper>
        )}

        {/* QR Code Full Screen Modal */}
        <Dialog 
          open={!!selectedQR} 
          onClose={() => setSelectedQR(null)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>QR Kod</DialogTitle>
          <DialogContent sx={{ textAlign: 'center', py: 3 }}>
            {selectedQR && (
              <Box>
                {/* selectedQR bir base64 image string ise direkt göster, değilse QRCodeSVG ile oluştur */}
                {selectedQR.startsWith('data:image') ? (
                  <img src={selectedQR} alt="QR Code" style={{ width: '300px', height: '300px' }} />
                ) : (
                  <QRCodeSVG value={selectedQR} size={300} />
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Yemekhane görevlisine bu QR kodu gösteriniz.
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Yemekhane personeli bu QR kodu okutarak yemeğinizi kullanmış sayacaktır.
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

export default MyReservations;