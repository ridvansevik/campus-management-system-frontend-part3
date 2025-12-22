import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, Paper, Grid, Box, Chip, Divider, Button, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, CircularProgress 
} from '@mui/material';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Kullanıcı rolünü kontrol etmek için
  
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null); // Hangi şubeye kayıt olunuyor?

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ders Detayı
        const courseRes = await api.get(`/courses/${id}`);
        setCourse(courseRes.data.data);

        // 2. Bu derse ait Şubeler (Sections)
        // Backend'de sections endpoint'ine query parametresi eklemiştik
        const sectionsRes = await api.get(`/sections?course_id=${id}&year=2025`); // Örn: 2025 yılı filtreli
        setSections(sectionsRes.data.data);
      } catch (error) {
        toast.error("Ders bilgileri alınamadı.");
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleEnroll = async (sectionId) => {
    if (!window.confirm("Bu ders şubesine kayıt olmak istiyor musunuz?")) return;

    setEnrollingId(sectionId);
    try {
      await api.post('/enrollments', { sectionId });
      toast.success("Derse başarıyla kayıt oldunuz!");
      // İsteğe bağlı: Kapasiteyi güncellemek için sections verisini tekrar çekebiliriz
      // veya öğrenciyi "Derslerim" sayfasına yönlendirebiliriz
      navigate('/my-courses'); 
    } catch (error) {
      const msg = error.response?.data?.error || "Kayıt işlemi başarısız.";
      toast.error(msg);
    } finally {
      setEnrollingId(null);
    }
  };

  if (loading) return <Layout><Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box></Layout>;
  if (!course) return <Layout><Alert severity="error">Ders bulunamadı.</Alert></Layout>;

  return (
    <Layout>
      {/* Üst Başlık */}
      <Box sx={{ mb: 4 }}>
        <Button onClick={() => navigate('/courses')} sx={{ mb: 1, textTransform: 'none' }}>&larr; Derslere Dön</Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
          {course.code} - {course.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {course.department?.name}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Sol Kolon: Ders Bilgileri */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 0, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
            <Typography variant="h6" gutterBottom>Genel Bilgiler</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Kredi / AKTS</Typography>
              <Typography variant="body1">{course.credits} Kredi / {course.ects} AKTS</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Açıklama</Typography>
              <Typography variant="body2">{course.description || "Açıklama girilmemiş."}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Ön Koşullar</Typography>
              {course.prerequisites && course.prerequisites.length > 0 ? (
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                  {course.prerequisites.map(pre => (
                    <Chip key={pre.id} label={pre.code} size="small" color="warning" variant="outlined" />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">Yok</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Sağ Kolon: Şubeler ve Kayıt */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 0, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
            <Typography variant="h6" gutterBottom>Açılan Şubeler (Sections)</Typography>
            <Divider sx={{ mb: 2 }} />

            {sections.length === 0 ? (
              <Alert severity="info">Bu ders için bu dönem açılan şube bulunmamaktadır.</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Şube</TableCell>
                      <TableCell>Öğretim Üyesi</TableCell>
                      <TableCell>Program</TableCell>
                      <TableCell>Derslik</TableCell>
                      <TableCell>Kontenjan</TableCell>
                      <TableCell align="right">İşlem</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sections.map((section) => (
                      <TableRow key={section.id}>
                        <TableCell>Section {section.section_number}</TableCell>
                        <TableCell>{section.instructor?.user?.name || "Atanmamış"}</TableCell>
                        <TableCell>
                          {section.schedule_json ? (
                            section.schedule_json.map((s, i) => (
                              <div key={i} style={{ fontSize: '0.85rem' }}>
                                <strong>{s.day.slice(0,3)}</strong> {s.start_time}-{s.end_time}
                              </div>
                            ))
                          ) : "-"}
                        </TableCell>
                        <TableCell>{section.classroom?.room_number || "-"}</TableCell>
                        <TableCell>
                          {section.enrolled_count} / {section.capacity}
                        </TableCell>
                        <TableCell align="right">
                          {/* Sadece Öğrenciler Kaydolabilir */}
                          {user?.role === 'student' && (
                            <Button 
                              variant="contained" 
                              size="small" 
                              disableElevation
                              disabled={section.enrolled_count >= section.capacity || enrollingId === section.id}
                              onClick={() => handleEnroll(section.id)}
                              sx={{ borderRadius: 0, textTransform: 'none' }}
                            >
                              {enrollingId === section.id ? <CircularProgress size={20} color="inherit" /> : 'Kaydol'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default CourseDetail;