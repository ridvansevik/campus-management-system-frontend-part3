import { useState, useEffect } from 'react';
import { 
  Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Box, CircularProgress, Alert, Chip,
  Tabs, Tab
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0); // 0: Aktif, 1: Tamamlanan

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/enrollments/my-courses');
        setCourses(res.data.data);
      } catch (error) {
        console.error("Dersler yüklenemedi", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'student') {
      fetchCourses();
    }
  }, [user]);

  // Sekme Değişimi
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Verileri Filtrele
  // Aktif: Statüsü 'enrolled' olanlar
  const activeCourses = courses.filter(c => c.status === 'enrolled');
  
  // Tamamlanan: Statüsü 'passed' veya 'failed' olanlar
  const completedCourses = courses.filter(c => c.status === 'passed' || c.status === 'failed');

  // Ortak Tablo Render Fonksiyonu
  const renderTable = (data, isHistory = false) => (
    <TableContainer component={Paper} sx={{ borderRadius: 0, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
      <Table>
        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Ders Kodu</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Ders Adı</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Kredi</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Öğretim Üyesi</TableCell>
            {isHistory && <TableCell sx={{ fontWeight: 'bold' }}>Harf Notu</TableCell>}
            <TableCell sx={{ fontWeight: 'bold' }}>Durum</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isHistory ? 6 : 5} align="center" sx={{ py: 3 }}>
                <Typography color="text.secondary">Bu kategoride ders bulunmuyor.</Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((enrollment) => (
              <TableRow key={enrollment.id} hover>
                <TableCell>{enrollment.section?.course?.code}</TableCell>
                <TableCell>{enrollment.section?.course?.name}</TableCell>
                <TableCell>{enrollment.section?.course?.credits}</TableCell>
                <TableCell>
                  {enrollment.section?.instructor?.user?.name || 'Atanmamış'}
                </TableCell>
                
                {/* Geçmiş dersler için Harf Notu */}
                {isHistory && (
                  <TableCell>
                    <Chip 
                      label={enrollment.letter_grade || '-'} 
                      size="small" 
                      color={enrollment.status === 'passed' ? 'success' : 'error'}
                      variant={enrollment.letter_grade ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                )}

                <TableCell>
                  {enrollment.status === 'enrolled' && <Chip label="Devam Ediyor" color="primary" size="small" variant="outlined" />}
                  {enrollment.status === 'passed' && <Chip label="Geçti" color="success" size="small" />}
                  {enrollment.status === 'failed' && <Chip label="Kaldı" color="error" size="small" />}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loading) return <Layout><Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box></Layout>;
  if (user?.role !== 'student') return <Layout><Alert severity="error">Yetkisiz erişim.</Alert></Layout>;

  return (
    <Layout>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#2c3e50' }}>
        Derslerim
      </Typography>

      <Box sx={{ width: '100%' }}>
        {/* Sekmeler */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="ders sekmeleri">
            <Tab icon={<SchoolIcon />} iconPosition="start" label="Kayıtlı Dersler (Aktif)" />
            <Tab icon={<HistoryEduIcon />} iconPosition="start" label="Bitirilmiş Dersler" />
          </Tabs>
        </Box>

        {/* Aktif Dersler İçeriği */}
        <div role="tabpanel" hidden={tabValue !== 0}>
          {tabValue === 0 && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Şu an devam etmekte olduğunuz dersler aşağıdadır.
              </Alert>
              {renderTable(activeCourses, false)}
            </Box>
          )}
        </div>

        {/* Bitirilmiş Dersler İçeriği */}
        <div role="tabpanel" hidden={tabValue !== 1}>
          {tabValue === 1 && (
            <Box>
              <Alert severity="success" sx={{ mb: 2, bgcolor: '#e8f5e9', color: '#2e7d32' }}>
                Başarıyla tamamladığınız veya sonuçlanmış dersler aşağıdadır.
              </Alert>
              {renderTable(completedCourses, true)}
            </Box>
          )}
        </div>
      </Box>
    </Layout>
  );
};

export default MyCourses;