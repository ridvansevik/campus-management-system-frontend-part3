import React, { useState, useEffect } from 'react';
import { Container, Paper, TextField, Button, Typography, MenuItem, Box, Grid, CircularProgress } from '@mui/material';
import { createMenu, getCafeterias } from '../../services/mealService';
import { toast } from 'react-toastify';

const MenuManagement = () => {
  const [cafeterias, setCafeterias] = useState([]);
  const [loadingCafeterias, setLoadingCafeterias] = useState(true);
  const [formData, setFormData] = useState({
    date: '',
    meal_type: 'lunch',
    cafeteria_id: '',
    items_json: '', // Virgülle ayrılmış string olarak alıp array'e çevireceğiz
    price: 20
  });

  useEffect(() => {
    const fetchCafeterias = async () => {
      try {
        const res = await getCafeterias();
        setCafeterias(res.data.data);
        // İlk cafeteria'yı varsayılan olarak seç
        if (res.data.data.length > 0) {
          setFormData(prev => ({ ...prev, cafeteria_id: res.data.data[0].id }));
        }
      } catch (error) {
        toast.error('Yemekhaneler yüklenemedi: ' + error.response?.data?.error);
      } finally {
        setLoadingCafeterias(false);
      }
    };
    fetchCafeterias();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cafeteria_id) {
      toast.error('Lütfen bir yemekhane seçin');
      return;
    }

    try {
      const payload = {
        ...formData,
        // String'i array'e çevir: "Çorba, Pilav" -> ["Çorba", "Pilav"]
        items_json: formData.items_json.split(',').map(item => item.trim()),
      };

      await createMenu(payload);
      toast.success('Menü başarıyla oluşturuldu');
      setFormData({ ...formData, items_json: '', date: '' });
    } catch (error) {
      toast.error('Menü oluşturulamadı: ' + error.response?.data?.error);
    }
  };

  if (loadingCafeterias) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Yeni Yemek Menüsü Ekle</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Tarih"
                InputLabelProps={{ shrink: true }}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Öğün Tipi"
                value={formData.meal_type}
                onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                required
              >
                <MenuItem value="lunch">Öğle Yemeği</MenuItem>
                <MenuItem value="dinner">Akşam Yemeği</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Yemekhane"
                value={formData.cafeteria_id}
                onChange={(e) => setFormData({ ...formData, cafeteria_id: e.target.value })}
                required
              >
                {cafeterias.map((cafeteria) => (
                  <MenuItem key={cafeteria.id} value={cafeteria.id}>
                    {cafeteria.name} {cafeteria.location ? `- ${cafeteria.location}` : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Fiyat (TL)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Yemekler (Virgülle ayırın)"
                placeholder="Mercimek Çorbası, Orman Kebabı, Pilav, Ayran"
                value={formData.items_json}
                onChange={(e) => setFormData({ ...formData, items_json: e.target.value })}
                required
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" size="large">Menüyü Kaydet</Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default MenuManagement;