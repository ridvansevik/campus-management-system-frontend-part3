import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Card, CardContent, Typography, Button, Chip, Box, CardActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, Paper
} from '@mui/material';
import { getEvents, registerEvent } from '../services/eventService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PeopleIcon from '@mui/icons-material/People';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, categoryFilter, dateFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (categoryFilter !== 'all') filters.category = categoryFilter;
      if (dateFilter) filters.date = dateFilter;
      if (searchTerm) filters.search = searchTerm;
      
      const res = await getEvents(filters);
      setEvents(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Etkinlikler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter (already applied in API call, but can also filter client-side)
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    // Date filter (already applied in API call, but can also filter client-side)
    if (dateFilter) {
      filtered = filtered.filter(event => event.date === dateFilter);
    }

    setFilteredEvents(filtered);
  };

  const handleRegister = async (eventId) => {
    try {
      await registerEvent(eventId);
      toast.success('Etkinliğe başarıyla kayıt oldunuz!');
      fetchEvents(); // Kontenjan bilgisini güncellemek için
    } catch (error) {
      toast.error(error.response?.data?.error || 'Kayıt başarısız');
    }
  };

  const categories = ['all', 'conference', 'workshop', 'social', 'sports', 'academic', 'cultural'];

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          Kampüs Etkinlikleri
        </Typography>

        {/* Filtreler */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <FilterListIcon color="primary" />
            <Typography variant="h6">Filtreler</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Ara"
                placeholder="Etkinlik adı veya açıklama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Kategori"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="all">Tümü</MenuItem>
                  <MenuItem value="conference">Konferans</MenuItem>
                  <MenuItem value="workshop">Atölye</MenuItem>
                  <MenuItem value="social">Sosyal</MenuItem>
                  <MenuItem value="sports">Spor</MenuItem>
                  <MenuItem value="academic">Akademik</MenuItem>
                  <MenuItem value="cultural">Kültürel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Tarih"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Etkinlik Listesi */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Yükleniyor...</Typography>
          </Box>
        ) : filteredEvents.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Etkinlik bulunamadı.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Filtreleri değiştirerek tekrar deneyin.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredEvents.map((event) => (
              <Grid item xs={12} md={6} lg={4} key={event.id}>
                <Card 
                  elevation={2} 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 6 }
                  }}
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="h6" component="div" sx={{ flex: 1, mr: 1 }}>
                        {event.title}
                      </Typography>
                      <Chip 
                        label={event.category} 
                        color="primary" 
                        size="small" 
                        variant="outlined" 
                      />
                    </Box>
                    
                    <Typography 
                      color="text.secondary" 
                      sx={{ 
                        mt: 1, 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {event.description}
                    </Typography>

                    <Box display="flex" alignItems="center" gap={1} sx={{ mt: 2, mb: 1 }}>
                      <EventIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {new Date(event.date).toLocaleDateString('tr-TR')} | {event.start_time}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                      <LocationOnIcon fontSize="small" color="action" />
                      <Typography variant="body2">{event.location}</Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                      <PeopleIcon fontSize="small" color="action" />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: event.registered_count >= event.capacity ? 'error.main' : 'success.main',
                          fontWeight: 'bold'
                        }}
                      >
                        {event.registered_count} / {event.capacity} kişi
                      </Typography>
                    </Box>

                    {event.is_paid && event.price > 0 && (
                      <Chip 
                        label={`${event.price} ₺`} 
                        color="warning" 
                        size="small" 
                        sx={{ mb: 1 }}
                      />
                    )}

                    {event.registration_deadline && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Son kayıt: {new Date(event.registration_deadline).toLocaleDateString('tr-TR')}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      sx={{ mr: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/events/${event.id}`);
                      }}
                    >
                      Detay
                    </Button>
                    <Button 
                      variant="contained" 
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegister(event.id);
                      }}
                      disabled={event.registered_count >= event.capacity}
                    >
                      {event.registered_count >= event.capacity ? 'Dolu' : 'Kayıt Ol'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Layout>
  );
};

export default Events;