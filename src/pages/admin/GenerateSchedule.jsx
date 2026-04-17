import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Button, Box, Alert, CircularProgress,
  Grid, Card, CardContent, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { generateSchedule } from '../../services/scheduleService';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { useTranslation } from 'react-i18next';

const GenerateSchedule = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  // Aktif dönem ve yıl otomatik seçiliyor (Spring 2025)
  const [semester, setSemester] = useState('Spring');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [clearExisting, setClearExisting] = useState(true); // Varsayılan: mevcut programı temizle
  const [previewModal, setPreviewModal] = useState({ open: false, schedule: null });

  const handleGenerate = async () => {
    if (!semester || !year) {
      toast.error(t('generate_schedule.enter_params'));
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      console.log('Program oluşturma isteği:', { semester, year, clearExisting });
      const res = await generateSchedule({ semester, year, clearExisting });
      console.log('Program oluşturma sonucu:', res.data);

      if (res.data.success) {
        setResult(res.data);
        const scheduleCount = res.data.data?.length || 0;
        if (scheduleCount > 0) {
          toast.success(t('generate_schedule.success_msg', { count: scheduleCount }));
        } else {
          toast.warning(t('generate_schedule.warning_msg'));
        }
      } else {
        toast.error(res.data.message || t('generate_schedule.error_msg'));
        setResult(res.data);
      }
    } catch (error) {
      console.error('Program oluşturma hatası:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || t('generate_schedule.error_msg');
      toast.error(errorMessage);
      if (error.response?.data) {
        setResult(error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <CalendarMonthIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {t('generate_schedule.title')}
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            <strong>{t('generate_schedule.system_title')}</strong>
          </Typography>
          <Typography variant="body2" component="div">
            {t('generate_schedule.system_desc')}
            <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
              <li><strong>{t('generate_schedule.conflict_instructor')}</strong></li>
              <li><strong>{t('generate_schedule.conflict_student')}</strong></li>
              <li><strong>{t('generate_schedule.conflict_classroom')}</strong></li>
              <li><strong>{t('generate_schedule.capacity_check')}</strong></li>
            </Box>
          </Typography>
        </Alert>

        {/* Parametreler */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('generate_schedule.params_title')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>{t('generate_schedule.semester')}</InputLabel>
                <Select
                  value={semester}
                  label={t('generate_schedule.semester')}
                  onChange={(e) => setSemester(e.target.value)}
                >
                  <MenuItem value="Fall">{t('generate_schedule.fall')}</MenuItem>
                  <MenuItem value="Spring">{t('generate_schedule.spring')}</MenuItem>
                  <MenuItem value="Summer">{t('generate_schedule.summer')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('generate_schedule.year')}
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                inputProps={{ min: 2020, max: 2030 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>{t('generate_schedule.existing_schedule')}</InputLabel>
                <Select
                  value={clearExisting ? 'clear' : 'keep'}
                  label={t('generate_schedule.existing_schedule')}
                  onChange={(e) => setClearExisting(e.target.value === 'clear')}
                >
                  <MenuItem value="keep">{t('generate_schedule.keep')}</MenuItem>
                  <MenuItem value="clear">{t('generate_schedule.clear')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleGenerate}
              disabled={loading || !semester || !year}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CalendarMonthIcon />}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              {loading ? t('generate_schedule.generating_btn') : t('generate_schedule.generate_btn')}
            </Button>
          </Box>

          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>✓ {t('generate_schedule.active_check')}</strong>
            </Typography>
            <Typography variant="body2">
              {t('generate_schedule.check_desc')}
            </Typography>
            <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
              <li>{t('generate_schedule.check_list_1')}</li>
              <li>{t('generate_schedule.check_list_2')}</li>
              <li>{t('generate_schedule.check_list_3')}</li>
              <li>{t('generate_schedule.check_list_4')}</li>
            </Box>
          </Alert>
        </Paper>

        {/* Sonuç */}
        {result && (
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              {result.unassignedSections?.length > 0 ? (
                <WarningIcon color="warning" />
              ) : (
                <CheckCircleIcon color="success" />
              )}
              <Typography variant="h6">
                {t('generate_schedule.result_title')}
              </Typography>
            </Box>

            <Alert
              severity={result.success === false ? 'error' : (result.unassignedSections?.length > 0 ? 'warning' : 'success')}
              sx={{ mb: 2 }}
            >
              <Typography variant="body1" fontWeight="bold">
                {result.message || (result.success !== false ? t('generate_schedule.success_msg', { count: result.data?.length || 0 }) : t('generate_schedule.error_msg'))}
              </Typography>
              {result.success && result.stats && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" display="block">
                    • {t('generate_schedule.total_sections')}: {result.stats.totalSections} | {t('generate_schedule.scheduled_sections')}: {result.stats.scheduledSections}
                  </Typography>
                  <Typography variant="caption" display="block">
                    • {t('generate_schedule.total_classrooms')}: {result.stats.totalClassrooms} | {t('generate_schedule.total_enrollments')}: {result.stats.totalEnrollments}
                  </Typography>
                </Box>
              )}
            </Alert>

            {result.success === false && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>{t('generate_schedule.possible_causes')}</strong>
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 0, mt: 1 }}>
                  <li>{t('generate_schedule.cause_no_sections')}</li>
                  <li>{t('generate_schedule.cause_no_classrooms')}</li>
                  <li>{t('generate_schedule.cause_conflicts')}</li>
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {t('generate_schedule.suggestion')}
                </Typography>
              </Alert>
            )}

            {result.data && result.data.length > 0 && (
              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    ✓ {t('generate_schedule.scheduled_courses')} ({result.data.length})
                  </Typography>
                  <Chip
                    label={t('generate_schedule.no_conflict')}
                    color="success"
                    size="small"
                    icon={<CheckCircleIcon />}
                  />
                </Box>
                <Grid container spacing={2}>
                  {result.data.slice(0, 12).map((schedule) => (
                    <Grid item xs={12} sm={6} md={4} key={schedule.id}>
                      <Card
                        elevation={1}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { boxShadow: 4 }
                        }}
                        onClick={() => setPreviewModal({ open: true, schedule })}
                      >
                        <CardContent>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {schedule.section?.course?.code || t('common.course')} - {schedule.section?.course?.name || ''}
                          </Typography>
                          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            <strong>{t('generate_schedule.day')}:</strong> {schedule.day_of_week} | <strong>{t('generate_schedule.time')}:</strong> {schedule.start_time} - {schedule.end_time}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            <strong>{t('generate_schedule.classroom')}:</strong> {schedule.classroom?.code || t('generate_schedule.no_classroom')}
                          </Typography>
                          {schedule.section?.instructor && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              <strong>{t('generate_schedule.instructor')}:</strong> {schedule.section.instructor.user?.name || schedule.section.instructor.name || t('generate_schedule.unspecified')}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                {result.data.length > 12 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {t('generate_schedule.more_courses', { count: result.data.length - 12 })}
                  </Typography>
                )}
              </Box>
            )}

            {result.unassignedSections && result.unassignedSections.length > 0 && (
              <Alert severity="warning">
                <Typography variant="subtitle2" gutterBottom>
                  {t('generate_schedule.unassigned_courses')} ({result.unassignedSections.length})
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                  {result.unassignedSections.map((section, idx) => (
                    <li key={idx}>
                      <Typography variant="body2">
                        {section.course || section.id} - {t('generate_schedule.conflict_or_resource')}
                      </Typography>
                    </li>
                  ))}
                </Box>
              </Alert>
            )}
          </Paper>
        )}

        {/* Önizleme Modal */}
        <Dialog
          open={previewModal.open}
          onClose={() => setPreviewModal({ open: false, schedule: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t('generate_schedule.course_detail')}</DialogTitle>
          <DialogContent>
            {previewModal.schedule && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {previewModal.schedule.section?.course?.code || t('common.course')}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>{t('generate_schedule.day')}:</strong> {previewModal.schedule.day_of_week}
                  </Typography>
                  <Typography variant="body2">
                    <strong>{t('generate_schedule.time')}:</strong> {previewModal.schedule.start_time} - {previewModal.schedule.end_time}
                  </Typography>
                  <Typography variant="body2">
                    <strong>{t('generate_schedule.classroom')}:</strong> {previewModal.schedule.classroom?.code || t('generate_schedule.no_classroom')}
                  </Typography>
                  {previewModal.schedule.section?.instructor && (
                    <Typography variant="body2">
                      <strong>{t('generate_schedule.instructor')}:</strong> {previewModal.schedule.section.instructor.user?.name || previewModal.schedule.section.instructor.name || t('generate_schedule.unspecified')}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewModal({ open: false, schedule: null })}>
              {t('generate_schedule.close')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default GenerateSchedule;

