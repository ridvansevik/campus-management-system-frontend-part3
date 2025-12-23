import { useState, useEffect } from 'react';
import { 
  Typography, Paper, Box, TextField, MenuItem, Button, 
  Table, TableBody, TableCell, TableHead, TableRow, 
  CircularProgress, Alert, Chip 
} from '@mui/material';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Gradebook = () => {
  const { user } = useAuth();
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Hocanın Şubelerini Getir
  useEffect(() => {
    const fetchSections = async () => {
      try {
        // Backend otomatik olarak öğretim üyesinin kendi derslerini getiriyor
        const res = await api.get('/sections');
        setSections(res.data.data || []);
      } catch (error) {
        console.error("Şubeler alınamadı", error);
        toast.error('Dersler yüklenemedi');
      }
    };
    if (user?.role === 'faculty') {
      fetchSections();
    }
  }, [user]);

  // 2. Seçilen Şubedeki Öğrencileri Getir
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedSection) return;
      setLoading(true);
      try {
        // Backend'de /enrollments/section/:sectionId endpoint'i mevcut
        const res = await api.get(`/enrollments/section/${selectedSection}`);
        setStudents(res.data.data || []);
      } catch (error) {
        console.error("Öğrenci listesi alınamadı", error);
        toast.error(error.response?.data?.error || 'Öğrenci listesi yüklenemedi');
        setStudents([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedSection]);

  const handleGradeChange = (enrollmentId, field, value) => {
    setStudents(prev => prev.map(stu => 
      stu.id === enrollmentId ? { ...stu, [field]: value } : stu
    ));
  };

  const handleSave = async (enrollmentId) => {
    const student = students.find(s => s.id === enrollmentId);
    try {
      await api.put(`/grades/${enrollmentId}`, {
        midterm_grade: student.midterm_grade,
        final_grade: student.final_grade
      });
      toast.success("Not kaydedildi.");
    } catch (error) {
      toast.error("Not kaydedilemedi.");
    }
  };

  if (user?.role !== 'faculty') {
    return (
      <Layout>
        <Alert severity="error">Bu sayfa sadece öğretim üyeleri için erişilebilir.</Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#2c3e50' }}>
        Derslerim ve Öğrencilerim
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <TextField
          select
          label="Ders Şubesi Seçin"
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          fullWidth
        >
          {sections.map((sec) => (
            <MenuItem key={sec.id} value={sec.id}>
              {sec.course?.code} - {sec.course?.name} (Section {sec.section_number})
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      {sections.length === 0 ? (
        <Alert severity="info">
          Henüz size atanmış bir ders bulunmamaktadır. Admin tarafından ders atandıktan sonra burada görünecektir.
        </Alert>
      ) : (
        <>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : selectedSection ? (
            students.length === 0 ? (
              <Alert severity="info">Bu derse kayıtlı öğrenci bulunamadı. Öğrenciler ders seçtikten sonra burada görünecektir.</Alert>
            ) : (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Kayıtlı Öğrenciler ({students.length})
                </Typography>
                <Table>
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell><strong>Öğrenci No</strong></TableCell>
                      <TableCell><strong>Ad Soyad</strong></TableCell>
                      <TableCell><strong>E-posta</strong></TableCell>
                      <TableCell><strong>Vize (%40)</strong></TableCell>
                      <TableCell><strong>Final (%60)</strong></TableCell>
                      <TableCell><strong>Harf Notu</strong></TableCell>
                      <TableCell><strong>Durum</strong></TableCell>
                      <TableCell><strong>İşlem</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((enrollment) => (
                      <TableRow key={enrollment.id} hover>
                        <TableCell>{enrollment.student?.student_number || '-'}</TableCell>
                        <TableCell>{enrollment.student?.user?.name || '-'}</TableCell>
                        <TableCell>{enrollment.student?.user?.email || '-'}</TableCell>
                        <TableCell>
                          <TextField 
                            type="number" 
                            size="small" 
                            variant="outlined"
                            value={enrollment.midterm_grade || ''} 
                            onChange={(e) => handleGradeChange(enrollment.id, 'midterm_grade', e.target.value)}
                            sx={{ width: 80 }}
                            inputProps={{ min: 0, max: 100, step: 0.01 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField 
                            type="number" 
                            size="small" 
                            variant="outlined"
                            value={enrollment.final_grade || ''}
                            onChange={(e) => handleGradeChange(enrollment.id, 'final_grade', e.target.value)}
                            sx={{ width: 80 }}
                            inputProps={{ min: 0, max: 100, step: 0.01 }}
                          />
                        </TableCell>
                        <TableCell>
                          {enrollment.letter_grade ? (
                            <Chip 
                              label={enrollment.letter_grade} 
                              size="small" 
                              color={enrollment.status === 'failed' ? 'error' : 'success'} 
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={enrollment.status === 'enrolled' ? 'Devam Ediyor' : enrollment.status}
                            size="small"
                            color={enrollment.status === 'enrolled' ? 'primary' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="small" 
                            variant="contained" 
                            onClick={() => handleSave(enrollment.id)}
                            disabled={!enrollment.midterm_grade && !enrollment.final_grade}
                          >
                            Kaydet
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )
          ) : (
            <Alert severity="info">
              Lütfen yukarıdan bir ders şubesi seçin. Seçtiğiniz derse kayıtlı öğrenciler burada görünecektir.
            </Alert>
          )}
        </>
      )}
    </Layout>
  );
};

export default Gradebook;