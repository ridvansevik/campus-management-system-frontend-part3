import { useState, useEffect } from 'react';
import { 
  Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Box, CircularProgress, Alert, Chip, Button 
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download'; // <--- YENİ
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const MyGrades = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [gpa, setGpa] = useState(0);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false); // İndirme durumu

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await api.get('/grades/my-grades');
        setGrades(res.data.data);
        setGpa(res.data.gpa);
      } catch (error) {
        console.error("Notlar alınamadı", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'student') fetchGrades();
  }, [user]);

  // YENİ: PDF İndirme Fonksiyonu
  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      // responseType: 'blob' çok önemli! Dosya (binary) geleceğini belirtir.
      const res = await api.get('/grades/transcript/pdf', {
        responseType: 'blob'
      });

      // Blob'dan indirilebilir URL oluştur
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Transkript-${user.studentProfile?.student_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Transkript indirildi.");
    } catch (error) {
      console.error("PDF Hatası:", error);
      toast.error("Transkript indirilemedi.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <Layout><Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box></Layout>;
  if (user?.role !== 'student') return <Layout><Alert severity="error">Yetkisiz erişim.</Alert></Layout>;

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>Notlarım</Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* YENİ BUTON */}
          <Button 
            variant="outlined" 
            startIcon={downloading ? <CircularProgress size={20} /> : <DownloadIcon />} 
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            Transkript İndir (PDF)
          </Button>
          
          <Paper sx={{ p: 2, bgcolor: '#e3f2fd', border: '1px solid #90caf9' }}>
            <Typography variant="h6" color="primary">GPA: {gpa}</Typography>
          </Paper>
        </Box>
      </Box>

      {grades.length === 0 ? (
        <Alert severity="info">Henüz not girişi yapılmış dersiniz yok.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Ders Kodu</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Ders Adı</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Kredi</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Vize</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Final</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Harf</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Durum</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grades.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell>{grade.section?.course?.code}</TableCell>
                  <TableCell>{grade.section?.course?.name}</TableCell>
                  <TableCell>{grade.section?.course?.credits}</TableCell>
                  <TableCell>{grade.midterm_grade ?? '-'}</TableCell>
                  <TableCell>{grade.final_grade ?? '-'}</TableCell>
                  <TableCell>
                    {grade.letter_grade ? <Chip label={grade.letter_grade} color="primary" size="small" /> : '-'}
                  </TableCell>
                  <TableCell>
                    {grade.status === 'passed' && <Chip label="Geçti" color="success" size="small" variant="outlined" />}
                    {grade.status === 'failed' && <Chip label="Kaldı" color="error" size="small" variant="outlined" />}
                    {grade.status === 'enrolled' && <Chip label="Devam Ediyor" color="default" size="small" variant="outlined" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Layout>
  );
};

export default MyGrades;