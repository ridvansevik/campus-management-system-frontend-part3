import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Card, CardContent, Typography, Button, Box, 
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, 
  TextField, Paper
} from '@mui/material';
import { getMenus, createReservation, getMenuDetail } from '../services/mealService';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import { QRCodeSVG } from 'qrcode.react';

const MealMenu = () => {
  const [menus, setMenus] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reservationModal, setReservationModal] = useState({ open: false, menu: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMenus();
  }, [selectedDate]);

  const fetchMenus = async () => {
    try {
      const res = await getMenus(selectedDate);
      setMenus(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Menü yüklenemedi');
    }
  };

  const handleReserve = async (menuId) => {
    try {
      setLoading(true);
      const res = await createReservation({ menuId });
      toast.success('Rezervasyon oluşturuldu! QR kodunuz "Rezervasyonlarım" sayfasında.');
      setReservationModal({ open: false, menu: null });
      fetchMenus(); // Menü listesini güncelle
    } catch (error) {
      toast.error(error.response?.data?.error || 'Rezervasyon başarısız');
    } finally {
      setLoading(false);
    }
  };

  const openReservationModal = async (menu) => {
    try {
      // Menü detayını çek
      const detailRes = await getMenuDetail(menu.id);
      setReservationModal({ open: true, menu: detailRes.data.data });
    } catch (error) {
      // Detay çekilemezse mevcut menüyü kullan
      setReservationModal({ open: true, menu });
    }
  };

  // Menüleri öğün tipine göre grupla
  const lunchMenus = menus.filter(m => m.meal_type === 'lunch');
  const dinnerMenus = menus.filter(m => m.meal_type === 'dinner');

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Yemek Menüsü
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <CalendarTodayIcon color="primary" />
            <TextField
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Box>

        {/* Öğle Yemeği */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LocalDiningIcon /> Öğle Yemeği
          </Typography>
          <Grid container spacing={3}>
            {lunchMenus.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">Bu tarih için öğle yemeği menüsü bulunamadı.</Typography>
                </Paper>
              </Grid>
            ) : (
              lunchMenus.map((menu) => (
                <Grid item xs={12} md={6} lg={4} key={menu.id}>
                  <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="h6" color="primary">
                          {menu.Cafeteria?.name || 'Yemekhane'}
                        </Typography>
                        <Chip 
                          label={parseFloat(menu.price) === 0 ? 'Ücretsiz' : `${menu.price} ₺`}
                          color={parseFloat(menu.price) === 0 ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>

                      {/* Menü Öğeleri */}
                      <Box sx={{ my: 2, minHeight: 100 }}>
                        {Array.isArray(menu.items_json) ? (
                          menu.items_json.map((item, idx) => (
                            <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                              • {typeof item === 'string' ? item : item.name || JSON.stringify(item)}
                            </Typography>
                          ))
                        ) : menu.items_json ? (
                          Object.entries(menu.items_json).map(([key, value]) => (
                            <Typography key={key} variant="body2" sx={{ mb: 0.5 }}>
                              <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">Menü bilgisi yok</Typography>
                        )}
                      </Box>

                      {/* Beslenme Bilgileri */}
                      {menu.nutrition_json && (
                        <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="caption" display="block">
                            <strong>Kalori:</strong> {menu.nutrition_json.calories || 'N/A'} kcal
                          </Typography>
                          {menu.nutrition_json.protein && (
                            <Typography variant="caption" display="block">
                              <strong>Protein:</strong> {menu.nutrition_json.protein} g
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* Vegan/Vegetarian Badges */}
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {menu.items_json && JSON.stringify(menu.items_json).toLowerCase().includes('vegan') && (
                          <Chip label="Vegan" color="success" size="small" />
                        )}
                        {menu.items_json && JSON.stringify(menu.items_json).toLowerCase().includes('vegetarian') && (
                          <Chip label="Vegetarian" color="success" size="small" variant="outlined" />
                        )}
                      </Box>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button 
                        variant="contained" 
                        fullWidth 
                        onClick={() => openReservationModal(menu)}
                        disabled={loading}
                      >
                        Rezervasyon Yap
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>

        {/* Akşam Yemeği */}
        <Box>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LocalDiningIcon /> Akşam Yemeği
          </Typography>
          <Grid container spacing={3}>
            {dinnerMenus.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">Bu tarih için akşam yemeği menüsü bulunamadı.</Typography>
                </Paper>
              </Grid>
            ) : (
              dinnerMenus.map((menu) => (
                <Grid item xs={12} md={6} lg={4} key={menu.id}>
                  <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="h6" color="primary">
                          {menu.Cafeteria?.name || 'Yemekhane'}
                        </Typography>
                        <Chip 
                          label={parseFloat(menu.price) === 0 ? 'Ücretsiz' : `${menu.price} ₺`}
                          color={parseFloat(menu.price) === 0 ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>

                      <Box sx={{ my: 2, minHeight: 100 }}>
                        {Array.isArray(menu.items_json) ? (
                          menu.items_json.map((item, idx) => (
                            <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                              • {typeof item === 'string' ? item : item.name || JSON.stringify(item)}
                            </Typography>
                          ))
                        ) : menu.items_json ? (
                          Object.entries(menu.items_json).map(([key, value]) => (
                            <Typography key={key} variant="body2" sx={{ mb: 0.5 }}>
                              <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">Menü bilgisi yok</Typography>
                        )}
                      </Box>

                      {menu.nutrition_json && (
                        <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="caption" display="block">
                            <strong>Kalori:</strong> {menu.nutrition_json.calories || 'N/A'} kcal
                          </Typography>
                          {menu.nutrition_json.protein && (
                            <Typography variant="caption" display="block">
                              <strong>Protein:</strong> {menu.nutrition_json.protein} g
                            </Typography>
                          )}
                        </Box>
                      )}

                      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {menu.items_json && JSON.stringify(menu.items_json).toLowerCase().includes('vegan') && (
                          <Chip label="Vegan" color="success" size="small" />
                        )}
                        {menu.items_json && JSON.stringify(menu.items_json).toLowerCase().includes('vegetarian') && (
                          <Chip label="Vegetarian" color="success" size="small" variant="outlined" />
                        )}
                      </Box>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button 
                        variant="contained" 
                        fullWidth 
                        onClick={() => openReservationModal(menu)}
                        disabled={loading}
                      >
                        Rezervasyon Yap
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>

        {/* Rezervasyon Onay Modal */}
        <Dialog open={reservationModal.open} onClose={() => setReservationModal({ open: false, menu: null })} maxWidth="sm" fullWidth>
          <DialogTitle>Rezervasyon Onayı</DialogTitle>
          <DialogContent>
            {reservationModal.menu && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {reservationModal.menu.meal_type === 'lunch' ? 'Öğle Yemeği' : 'Akşam Yemeği'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tarih: {reservationModal.menu.date}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Yemekhane: {reservationModal.menu.Cafeteria?.name}
                </Typography>
                {parseFloat(reservationModal.menu.price) > 0 && (
                  <Typography variant="body1" color="primary" sx={{ mt: 2 }}>
                    Ücret: {reservationModal.menu.price} ₺
                  </Typography>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReservationModal({ open: false, menu: null })}>İptal</Button>
            <Button 
              variant="contained" 
              onClick={() => handleReserve(reservationModal.menu.id)}
              disabled={loading}
            >
              Onayla
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default MealMenu;