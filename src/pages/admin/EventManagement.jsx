import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Grid } from '@mui/material';
import { createEvent } from '../../services/eventService';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';

const EventManagement = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Social',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    capacity: 100
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEvent(formData);
      toast.success(t('event_management.success_create'));
      setFormData({ ...formData, title: '', description: '' });
    } catch (error) {
      toast.error(t('event_management.error_create') + ': ' + error.response?.data?.error);
    }
  };

  return (
    <Layout>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>{t('event_management.create_title')}</Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth name="title" label={t('event_management.title_label')} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth name="description" label={t('event_management.description_label')} multiline rows={3} onChange={handleChange} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth name="category" label={t('event_management.category_label')} onChange={handleChange} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth name="location" label={t('event_management.location_label')} onChange={handleChange} required />
              </Grid>
              <Grid item xs={4}>
                <TextField fullWidth type="date" name="date" label={t('event_management.date_label')} InputLabelProps={{ shrink: true }} onChange={handleChange} required />
              </Grid>
              <Grid item xs={4}>
                <TextField fullWidth type="time" name="start_time" label={t('event_management.start_time_label')} InputLabelProps={{ shrink: true }} onChange={handleChange} required />
              </Grid>
              <Grid item xs={4}>
                <TextField fullWidth type="time" name="end_time" label={t('event_management.end_time_label')} InputLabelProps={{ shrink: true }} onChange={handleChange} required />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth type="number" name="capacity" label={t('event_management.capacity_label')} value={formData.capacity} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" size="large">{t('event_management.create_btn')}</Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Layout>
  );
};

export default EventManagement;