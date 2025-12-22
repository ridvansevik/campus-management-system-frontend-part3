import { useState, useEffect } from 'react';
import { 
  Typography, Paper, Grid, Box, Chip, Button, IconButton, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  CircularProgress, Alert, Card, CardContent, CardActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CampaignIcon from '@mui/icons-material/Campaign'; // Megafon ikonu
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Announcements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', target_role: 'all', priority: 'normal' });

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data.data);
    } catch (error) {
      console.error("Duyurular alınamadı", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast.warning("Başlık ve içerik zorunludur.");
      return;
    }
    try {
      await api.post('/announcements', formData);
      toast.success("Duyuru yayınlandı.");
      setOpen(false);
      setFormData({ title: '', content: '', target_role: 'all', priority: 'normal' }); // Reset
      fetchAnnouncements();
    } catch (error) {
      toast.error("Duyuru eklenemedi.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu duyuruyu silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast.success("Duyuru silindi.");
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      toast.error("Silme işlemi başarısız.");
    }
  };

  if (loading) return <Layout><Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box></Layout>;

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
          Duyurular
        </Typography>
        {user?.role === 'admin' && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => setOpen(true)}
            disableElevation
          >
            Yeni Duyuru
          </Button>
        )}
      </Box>

      {announcements.length === 0 ? (
        <Alert severity="info">Henüz yayınlanmış bir duyuru yok.</Alert>
      ) : (
        <Grid container spacing={3}>
          {announcements.map((ann) => (
            <Grid item xs={12} key={ann.id}>
              <Card sx={{ 
                borderRadius: 2, 
                borderLeft: ann.priority === 'high' ? '6px solid #d32f2f' : '6px solid #1976d2',
                boxShadow: 2 
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CampaignIcon color={ann.priority === 'high' ? 'error' : 'primary'} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {ann.title}
                      </Typography>
                      {ann.priority === 'high' && <Chip label="ÖNEMLİ" color="error" size="small" />}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(ann.created_at).toLocaleDateString('tr-TR')}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
                    {ann.content}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Chip 
                      label={ann.target_role === 'all' ? 'Genel' : ann.target_role === 'student' ? 'Öğrenciler' : 'Akademik'} 
                      size="small" 
                      variant="outlined" 
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </Box>
                </CardContent>

                {user?.role === 'admin' && (
                  <CardActions sx={{ justifyContent: 'flex-end', bgcolor: '#f9f9f9' }}>
                    <IconButton size="small" color="error" onClick={() => handleDelete(ann.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Duyuru Ekleme Modalı (Sadece Admin) */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Yeni Duyuru Yayınla</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Başlık"
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label="Hedef Kitle"
                fullWidth
                value={formData.target_role}
                onChange={(e) => setFormData({...formData, target_role: e.target.value})}
              >
                <MenuItem value="all">Herkes</MenuItem>
                <MenuItem value="student">Öğrenciler</MenuItem>
                <MenuItem value="faculty">Öğretim Üyeleri</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label="Önem Derecesi"
                fullWidth
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">Yüksek (Acil)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="İçerik"
                fullWidth
                multiline
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="inherit">İptal</Button>
          <Button onClick={handleSubmit} variant="contained">Yayınla</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Announcements;