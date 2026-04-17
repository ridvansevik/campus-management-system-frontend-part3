import React, { useState, useEffect } from 'react';
import { Container, Paper, TextField, Button, Typography, MenuItem, Box, Grid, CircularProgress } from '@mui/material';
import { createMenu, getCafeterias } from '../../services/mealService';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';

const MenuManagement = () => {
  const { t } = useTranslation();
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
        toast.error(t('menu_management.load_error') + ': ' + error.response?.data?.error);
      } finally {
        setLoadingCafeterias(false);
      }
    };
    fetchCafeterias();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cafeteria_id) {
      toast.error(t('menu_management.select_cafeteria'));
      return;
    }

    try {
      const payload = {
        ...formData,
        // String'i array'e çevir: "Çorba, Pilav" -> ["Çorba", "Pilav"]
        items_json: formData.items_json.split(',').map(item => item.trim()),
      };

      await createMenu(payload);
      toast.success(t('menu_management.success_create'));
      setFormData({ ...formData, items_json: '', date: '' });
    } catch (error) {
      toast.error(t('menu_management.error_create') + ': ' + error.response?.data?.error);
    }
  };

  if (loadingCafeterias) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>{t('menu_management.title')}</Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label={t('menu_management.date')}
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
                  label={t('menu_management.meal_type')}
                  value={formData.meal_type}
                  onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                  required
                >
                  <MenuItem value="lunch">{t('menu_management.lunch')}</MenuItem>
                  <MenuItem value="dinner">{t('menu_management.dinner')}</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label={t('menu_management.cafeteria')}
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
                  label={t('menu_management.price')}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('menu_management.items')}
                  placeholder={t('menu_management.items_placeholder')}
                  value={formData.items_json}
                  onChange={(e) => setFormData({ ...formData, items_json: e.target.value })}
                  required
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" size="large">{t('menu_management.save_btn')}</Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Layout>
  );
};

export default MenuManagement;