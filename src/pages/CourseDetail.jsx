import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]); // Başlangıç değeri boş dizi
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ders Detayı
        const courseRes = await api.get(`/courses/${id}`);
        if (courseRes.data && courseRes.data.data) {
          setCourse(courseRes.data.data);
        } else {
          throw new Error(t('course_detail.data_error'));
        }

        // 2. Bu derse ait Şubeler (Sections)
        try {
          // Önce aktif dönem bilgisini al
          const activeTermRes = await api.get('/system/active-term');
          const termData = activeTermRes.data?.data; // Güvenli erişim

          if (termData) {
            const { semester, year } = termData;
            const sectionsRes = await api.get(`/sections?course_id=${id}&semester=${semester}&year=${year}`);
            // GÜVENLİK ÖNLEMİ: Gelen veri null/undefined ise boş dizi ata
            setSections(sectionsRes.data?.data || []);
          }
        } catch (sectionError) {
          console.error("Şube bilgileri alınamadı:", sectionError);
          // Şubeler alınamazsa bile ders detayını göstermeye devam et, sections boş kalsın
          setSections([]);
        }

      } catch (error) {
        console.error("Ders detayı hatası:", error);
        toast.error(t('course_detail.display_error'));
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, navigate]);

  const handleEnroll = async (sectionId) => {
    if (!window.confirm(t('course_detail.enroll_confirm'))) return;

    setEnrollingId(sectionId);
    try {
      await api.post('/enrollments', { sectionId });
      toast.success(t('course_detail.enroll_success'));

      // Kayıt sonrası verileri güncelle
      const activeTermRes = await api.get('/system/active-term');
      const termData = activeTermRes.data?.data;
      if (termData) {
        const { semester, year } = termData;
        const sectionsRes = await api.get(`/sections?course_id=${id}&semester=${semester}&year=${year}`);
        setSections(sectionsRes.data?.data || []);
      }
    } catch (error) {
      const msg = error.response?.data?.error || t('course_detail.enroll_failed');
      toast.error(msg);
    } finally {
      setEnrollingId(null);
    }
  };

  if (loading) return <Layout><Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box></Layout>;

  // Course null ise hata göster (Loading false olduktan sonra)
  if (!course) return <Layout><Alert severity="error">{t('course_detail.not_found')}</Alert></Layout>;

  return (
    <Layout>
      {/* Üst Başlık */}
      <Box sx={{ mb: 4 }}>
        <Button onClick={() => navigate('/courses')} sx={{ mb: 1, textTransform: 'none' }}>&larr; {t('course_detail.back_to_courses')}</Button>
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
            <Typography variant="h6" gutterBottom>{t('course_detail.general_info')}</Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">{t('course_detail.credits_ects')}</Typography>
              <Typography variant="body1">{course.credits} {t('courses.credits')} / {course.ects} AKTS</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">{t('course_detail.description')}</Typography>
              <Typography variant="body2">{course.description || t('course_detail.desc_missing')}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">{t('course_detail.prerequisites')}</Typography>
              {course.prerequisites && course.prerequisites.length > 0 ? (
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                  {course.prerequisites.map(pre => (
                    <Chip key={pre.id} label={pre.code} size="small" color="warning" variant="outlined" />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">{t('course_detail.none')}</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Sağ Kolon: Şubeler ve Kayıt */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 0, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
            <Typography variant="h6" gutterBottom>{t('course_detail.open_sections')}</Typography>
            <Divider sx={{ mb: 2 }} />

            {/* GÜVENLİK ÖNLEMİ: sections?.length kontrolü */}
            {!sections || sections.length === 0 ? (
              <Alert severity="info">{t('course_detail.no_active_sections')}</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('course_detail.section')}</TableCell>
                      <TableCell>{t('my_courses.instructor')}</TableCell>
                      <TableCell>{t('course_detail.schedule')}</TableCell>
                      <TableCell>{t('course_detail.classroom')}</TableCell>
                      <TableCell>{t('course_detail.quota')}</TableCell>
                      <TableCell align="right">{t('course_detail.action')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* GÜVENLİK ÖNLEMİ: sections?.map kontrolü */}
                    {sections?.map((section) => (
                      <TableRow key={section.id}>
                        <TableCell>{t('course_detail.section')} {section.section_number}</TableCell>
                        <TableCell>{section.instructor?.user?.name || t('my_courses.not_assigned')}</TableCell>
                        <TableCell>
                          {section.schedule_json && Array.isArray(section.schedule_json) ? (
                            section.schedule_json.map((s, i) => (
                              <div key={i} style={{ fontSize: '0.85rem' }}>
                                <strong>{s.day ? t(`department_schedules.days.${s.day}`)?.slice(0, 3) : ''}</strong> {s.start_time}-{s.end_time}
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
                              {enrollingId === section.id ? <CircularProgress size={20} color="inherit" /> : t('course_detail.enroll')}
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