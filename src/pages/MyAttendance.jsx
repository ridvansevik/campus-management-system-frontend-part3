import { useState, useEffect } from 'react';
import { 
  Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Box, CircularProgress, Alert, Grid, Divider
} from '@mui/material';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyAttendance = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ stats: [], history: [] }); // Veri yapısı değişti
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get('/attendance/my-attendance');
        // Backend'den { stats: [...], history: [...] } dönüyor
        setData(res.data.data); 
      } catch (error) {
        console.error("Yoklama verisi çekilemedi", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'student') {
      fetchAttendance();
    }
  }, [user]);

  // Devamsızlık oranına göre renk belirleme
  const getStatusColor = (absenceRate) => {
    const rate = parseFloat(absenceRate);
    if (rate > 30) return { bg: '#ffebee', text: '#c62828', label: 'KRİTİK' }; // Kırmızı
    if (rate > 20) return { bg: '#fff3e0', text: '#ef6c00', label: 'UYARI' };  // Turuncu
    return { bg: '#e8f5e9', text: '#2e7d32', label: 'İYİ' };      // Yeşil
  };

  if (loading) return <Layout><Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box></Layout>;
  if (user?.role !== 'student') return <Layout><Alert severity="error">Yetkisiz erişim.</Alert></Layout>;

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold', color: '#2c3e50' }}>
          Yoklama Durumum
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ders bazlı katılım oranlarınız ve devamsızlık risk durumunuz aşağıdadır.
        </Typography>
      </Box>

      {/* 1. BÖLÜM: DERS BAZLI ÖZET TABLOSU */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1565c0' }}>
        Ders Bazlı İstatistikler
      </Typography>
      
      {data.stats.length === 0 ? (
         <Alert severity="info" sx={{ mb: 4 }}>Henüz kayıtlı olduğunuz bir ders bulunmuyor.</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 6, boxShadow: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Ders</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Toplam Oturum</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Katıldığınız</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Kaçırdığınız</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Katılım Oranı</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Durum</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.stats.map((stat) => {
                const status = getStatusColor(stat.absenceRate);
                return (
                  <TableRow key={stat.courseCode} sx={{ bgcolor: status.bg }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>
                      {stat.courseCode} - {stat.courseName}
                    </TableCell>
                    <TableCell align="center">{stat.totalSessions}</TableCell>
                    <TableCell align="center" sx={{ color: 'green', fontWeight: 'bold' }}>{stat.attendedSessions}</TableCell>
                    <TableCell align="center" sx={{ color: 'red', fontWeight: 'bold' }}>{stat.missedSessions}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress 
                          variant="determinate" 
                          value={parseFloat(stat.attendanceRate)} 
                          color={parseFloat(stat.absenceRate) > 20 ? "warning" : "primary"}
                          size={40}
                        />
                        <Box
                          sx={{
                            top: 0, left: 0, bottom: 0, right: 0,
                            position: 'absolute', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Typography variant="caption" component="div" color="text.secondary">
                            %{Math.round(stat.attendanceRate)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={status.label} 
                        sx={{ 
                          bgcolor: 'white', 
                          color: status.text, 
                          fontWeight: 'bold',
                          border: `1px solid ${status.text}`
                        }} 
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Divider sx={{ my: 4 }} />

      {/* 2. BÖLÜM: SON HAREKETLER (LOG) */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1565c0' }}>
        Son Yoklama Geçmişi
      </Typography>

      {data.history.length === 0 ? (
        <Alert severity="info">Henüz katıldığınız bir yoklama kaydı yok.</Alert>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ders</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tarih</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Giriş Saati</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Mesafe</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Durum</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.history.map((record) => {
                  const session = record.session;
                  const section = session?.section;
                  const course = section?.course;

                  return (
                    <TableRow key={record.id} hover>
                      <TableCell>{course?.code} - {course?.name}</TableCell>
                      <TableCell>{new Date(session.date).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>{new Date(record.check_in_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                      <TableCell>{Math.round(record.distance_from_center)}m</TableCell>
                      <TableCell>
                        <Chip 
                          label={record.is_flagged ? "Şüpheli" : "Başarılı"} 
                          color={record.is_flagged ? "warning" : "success"} 
                          size="small" 
                          variant="filled" 
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Layout>
  );
};

export default MyAttendance;