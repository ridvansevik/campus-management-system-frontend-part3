import { useState, useEffect } from 'react';
import { 
  Typography, Paper, Box, Button, Chip, Divider, 
  Card, CardContent, CardActions, Grid, Link, CircularProgress, Alert 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const ExcuseApproval = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/attendance/excuse-requests');
      setRequests(res.data.data);
    } catch (error) {
      console.error("Talepler alınamadı", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'faculty') {
      fetchRequests();
    }
  }, [user]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/attendance/excuse-requests/${id}`, { status });
      toast.success(`Talep ${status === 'approved' ? 'onaylandı' : 'reddedildi'}.`);
      fetchRequests(); // Listeyi yenile
    } catch (error) {
      toast.error("İşlem başarısız.");
    }
  };

  if (loading) return <Layout><Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box></Layout>;
  if (user?.role !== 'faculty') return <Layout><Alert severity="error">Yetkisiz erişim.</Alert></Layout>;

  return (
    <Layout>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#2c3e50' }}>
        Mazeret Onayları
      </Typography>

      {requests.length === 0 ? (
        <Alert severity="info">Bekleyen mazeret talebi yok.</Alert>
      ) : (
        <Grid container spacing={3}>
          {requests.map((req) => (
            <Grid item xs={12} md={6} key={req.id}>
              <Card sx={{ borderLeft: req.status === 'pending' ? '4px solid #ed6c02' : req.status === 'approved' ? '4px solid #2e7d32' : '4px solid #d32f2f' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {req.student?.user?.name}
                    </Typography>
                    <Chip 
                      label={req.status === 'pending' ? 'Bekliyor' : req.status === 'approved' ? 'Onaylandı' : 'Reddedildi'} 
                      color={req.status === 'pending' ? 'warning' : req.status === 'approved' ? 'success' : 'error'} 
                      size="small" 
                    />
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {req.student?.student_number} - {req.session?.section?.course?.name}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                    Tarih: {new Date(req.session?.date).toLocaleDateString('tr-TR')}
                  </Typography>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    "{req.reason}"
                  </Typography>

                  {req.document_url && (
                    <Box sx={{ mb: 2 }}>
                      <Link href={req.document_url} target="_blank" rel="noopener noreferrer">
                        Belgeyi Görüntüle
                      </Link>
                    </Box>
                  )}
                </CardContent>
                
                {req.status === 'pending' && (
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                    <Button 
                      startIcon={<CancelIcon />} 
                      color="error" 
                      onClick={() => handleUpdateStatus(req.id, 'rejected')}
                    >
                      Reddet
                    </Button>
                    <Button 
                      startIcon={<CheckCircleIcon />} 
                      color="success" 
                      variant="contained" 
                      disableElevation
                      onClick={() => handleUpdateStatus(req.id, 'approved')}
                    >
                      Onayla
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Layout>
  );
};

export default ExcuseApproval;