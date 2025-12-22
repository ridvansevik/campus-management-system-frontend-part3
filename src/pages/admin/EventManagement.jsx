import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Grid } from '@mui/material';
import { createEvent } from '../../services/eventService';
import { toast } from 'react-toastify';

const EventManagement = () => {
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
      toast.success('Etkinlik oluşturuldu!');
      setFormData({ ...formData, title: '', description: '' });
    } catch (error) {
      toast.error('Hata: ' + error.response?.data?.error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Yeni Etkinlik Oluştur</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth name="title" label="Etkinlik Başlığı" onChange={handleChange} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth name="description" label="Açıklama" multiline rows={3} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth name="category" label="Kategori" onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth name="location" label="Konum" onChange={handleChange} required />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth type="date" name="date" label="Tarih" InputLabelProps={{ shrink: true }} onChange={handleChange} required />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth type="time" name="start_time" label="Başlangıç" InputLabelProps={{ shrink: true }} onChange={handleChange} required />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth type="time" name="end_time" label="Bitiş" InputLabelProps={{ shrink: true }} onChange={handleChange} required />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="number" name="capacity" label="Kapasite" value={formData.capacity} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" size="large">Oluştur</Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default EventManagement;