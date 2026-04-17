import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
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
      const statusText = status === 'approved' ? t('excuse_approval.messages.approved') : t('excuse_approval.messages.rejected');
      toast.success(t('excuse_approval.messages.success_msg', { status: statusText }));
      fetchRequests(); // Listeyi yenile
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || t('excuse_approval.messages.error_msg');
      toast.error(errorMessage);
    }
  };

  if (loading) return <Layout><Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box></Layout>;
  if (user?.role !== 'faculty') return <Layout><Alert severity="error">{t('excuse_approval.messages.unauthorized')}</Alert></Layout>;

  return (
    <Layout>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#2c3e50' }}>
        {t('excuse_approval.title')}
      </Typography>

      {requests.length === 0 ? (
        <Alert severity="info">{t('excuse_approval.no_requests')}</Alert>
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
                      label={req.status === 'pending' ? t('excuse_approval.status.pending') : req.status === 'approved' ? t('excuse_approval.status.approved') : t('excuse_approval.status.rejected')}
                      color={req.status === 'pending' ? 'warning' : req.status === 'approved' ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {req.student?.student_number} - {req.session?.section?.course?.name}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                    {t('attendance_report.date')}: {new Date(req.session?.date).toLocaleDateString(i18n.language)}
                  </Typography>

                  <Divider sx={{ mb: 2 }} />

                  <Typography variant="body1" sx={{ mb: 2 }}>
                    "{req.reason}"
                  </Typography>

                  {req.document_url && (
                    <Box sx={{ mb: 2 }}>
                      <Link href={req.document_url} target="_blank" rel="noopener noreferrer">
                        {t('excuse_approval.actions.view_document')}
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
                      {t('excuse_approval.actions.reject')}
                    </Button>
                    <Button
                      startIcon={<CheckCircleIcon />}
                      color="success"
                      variant="contained"
                      disableElevation
                      onClick={() => handleUpdateStatus(req.id, 'approved')}
                    >
                      {t('excuse_approval.actions.approve')}
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