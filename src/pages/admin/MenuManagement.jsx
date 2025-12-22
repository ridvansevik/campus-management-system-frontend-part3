import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, MenuItem, Box, Grid } from '@mui/material';
import { createMenu } from '../../services/mealService';
import { toast } from 'react-toastify';

const MenuManagement = () => {
  const [formData, setFormData] = useState({
    date: '',
    meal_type: 'lunch',
    cafeteria_id: '', // Cafeteria ID'si normalde API'den çekilmeli, şimdilik manuel veya sabit
    items_json: '', // Virgülle ayrılmış string olarak alıp array'e çevireceğiz
    price: 20
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        // String'i array'e çevir: "Çorba, Pilav" -> ["Çorba", "Pilav"]
        items_json: formData.items_json.split(',').map(item => item.trim()),
        // Sabit bir cafeteria ID (Backend'deki bir ID ile değiştirilmeli)
        cafeteria_id: '123e4567-e89b-12d3-a456-426614174000' 
      };

      await createMenu(payload);
      toast.success('Menü başarıyla oluşturuldu');
      setFormData({ ...formData, items_json: '', date: '' });
    } catch (error) {
      toast.error('Menü oluşturulamadı: ' + error.response?.data?.error);
    }
  };

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
              >
                <MenuItem value="lunch">Öğle Yemeği</MenuItem>
                <MenuItem value="dinner">Akşam Yemeği</MenuItem>
              </TextField>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Fiyat (TL)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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