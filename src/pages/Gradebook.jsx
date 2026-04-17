import { useState, useEffect } from 'react';
import {
  Typography, Paper, Box, TextField, MenuItem, Button,
  Table, TableBody, TableCell, TableHead, TableRow,
  CircularProgress, Alert, Chip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Gradebook = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
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
        toast.error(t('gradebook.load_error'));
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
        toast.error(error.response?.data?.error || t('gradebook.student_load_error'));
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
      toast.success(t('gradebook.save_success'));
    } catch (error) {
      toast.error(t('gradebook.save_error'));
    }
  };

  if (user?.role !== 'faculty') {
    return (
      <Layout>
        <Alert severity="error">{t('gradebook.unauthorized')}</Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#2c3e50' }}>
        {t('gradebook.title')}
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <TextField
          select
          label={t('gradebook.select_section')}
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
          {t('gradebook.no_assigned_course')}
        </Alert>
      ) : (
        <>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : selectedSection ? (
            students.length === 0 ? (
              <Alert severity="info">{t('gradebook.no_students')}</Alert>
            ) : (
              <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  {t('gradebook.students_count')} ({students.length})
                </Typography>
                <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <Table sx={{ minWidth: 800 }}>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell><strong>{t('gradebook.student_no')}</strong></TableCell>
                        <TableCell><strong>{t('gradebook.name')}</strong></TableCell>
                        <TableCell><strong>{t('gradebook.email')}</strong></TableCell>
                        <TableCell><strong>{t('gradebook.midterm')}</strong></TableCell>
                        <TableCell><strong>{t('gradebook.final')}</strong></TableCell>
                        <TableCell><strong>{t('gradebook.letter_grade')}</strong></TableCell>
                        <TableCell><strong>{t('gradebook.status')}</strong></TableCell>
                        <TableCell><strong>{t('gradebook.action')}</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students.map((enrollment) => (
                        <TableRow key={enrollment.id} hover>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{enrollment.student?.student_number || '-'}</TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{enrollment.student?.user?.name || '-'}</TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{enrollment.student?.user?.email || '-'}</TableCell>
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
                              label={enrollment.status === 'enrolled' ? t('gradebook.status_enrolled') : enrollment.status}
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
                              {t('gradebook.save_btn')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Paper>
            )
          ) : (
            <Alert severity="info">
              {t('gradebook.select_section_info')}
            </Alert>
          )}
        </>
      )}
    </Layout>
  );
};

export default Gradebook;